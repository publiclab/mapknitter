class Exporter

  # pixels per meter = pxperm 
  def self.generate_perspectival_distort(pxperm, path, nodes_array, id, image_file_name, image, height, width)
    require 'net/http'
    
    # everything in -working/ can be deleted; 
    # this is just so we can use the files locally outside of s3
    working_directory = self.get_working_directory(path)
    Dir.mkdir(working_directory) unless (File.exists?(working_directory) && File.directory?(working_directory))
    local_location = working_directory+id.to_s+'-'+image_file_name.to_s

    directory = warps_directory(path)
    Dir.mkdir(directory) unless (File.exists?(directory) && File.directory?(directory))
    completed_local_location = directory+id.to_s+'.png'

    # everything -masked.png can be deleted
    masked_local_location = directory+id.to_s+'-masked.png'
    # everything -mask.png can be deleted
    mask_location = directory+id.to_s+'-mask.png'
    #completed_local_location = directory+id.to_s+'.tif'
    # know everything -unwarped can be deleted
    geotiff_location = directory+id.to_s+'-geo-unwarped.tif'
    # everything -geo WITH AN ID could be deleted, but there is a feature request to preserve these
    warped_geotiff_location = directory+id.to_s+'-geo.tif'

    northmost = nodes_array.first.lat
    southmost = nodes_array.first.lat
    westmost = nodes_array.first.lon
    eastmost = nodes_array.first.lon

    nodes_array.each do |node|
      northmost = node.lat if node.lat > northmost
      southmost = node.lat if node.lat < southmost
      westmost = node.lon if node.lon < westmost
      eastmost = node.lon if node.lon > eastmost
    end

    # puts northmost.to_s+','+southmost.to_s+','+westmost.to_s+','+eastmost.to_s
    
    scale = 20037508.34    
    y1 = pxperm*Cartagen.spherical_mercator_lat_to_y(northmost,scale)
    x1 = pxperm*Cartagen.spherical_mercator_lon_to_x(westmost,scale)
    y2 = pxperm*Cartagen.spherical_mercator_lat_to_y(southmost,scale)
    x2 = pxperm*Cartagen.spherical_mercator_lon_to_x(eastmost,scale)
    # puts x1.to_s+','+y1.to_s+','+x2.to_s+','+y2.to_s

    # should determine if it's stored in s3 or locally:
    if (image.url[0..3] == 'http')
      Net::HTTP.start('s3.amazonaws.com') { |http|
      #Net::HTTP.start('localhost') { |http|
        puts (image.url)
        resp = http.get(image.url)
        open(local_location, "wb") { |file|
          file.write(resp.body)
        }
      }
    else
      require "fileutils"
      FileUtils.cp(Rails.root.to_s+'/public'+image.to_s,local_location)
    end

    points = ""
    maskpoints = ""
    coordinates = ""
    first = true
 
#EXIF orientation values: 
#Value  0th Row  0th Column
#1  top  left side
#2  top  right side
#3  bottom  right side
#4  bottom  left side
#5  left side  top
#6  right side  top
#7  right side  bottom
#8  left side  bottom
  
  rotation = (`identify -format %[exif:Orientation] #{local_location}`).to_i  
  #stdin, stdout, stderr = Open3.popen3('identify -format %[exif:Orientation] #{local_location}')
  #rotation = stdout.readlines.first.to_s.to_i
  #puts stderr.readlines

    if rotation == 6
      puts 'rotated CCW'
      source_corners = source_corners = [[0,height],[0,0],[width,0],[width,height]]
    elsif rotation == 8
      puts 'rotated CW'
      source_corners = [[width,0],[width,height],[0,height],[0,0]]
    elsif rotation == 3
      puts 'rotated 180 deg'
      source_corners = [[width,height],[0,height],[0,0],[width,0]]
    else
      source_corners = [[0,0],[width,0],[width,height],[0,height]]
    end

    maxdimension = 0

    nodes_array.each do |node|
      corner = source_corners.shift
      nx1 = corner[0]
      ny1 = corner[1]
      nx2 = -x1+(pxperm*Cartagen.spherical_mercator_lon_to_x(node.lon,scale))
      ny2 = y1-(pxperm*Cartagen.spherical_mercator_lat_to_y(node.lat,scale))
 
      points = points + '  ' unless first
      maskpoints = maskpoints + ' ' unless first
      points = points + nx1.to_s + ',' + ny1.to_s + ' ' + nx2.to_i.to_s + ',' + ny2.to_i.to_s
      maskpoints = maskpoints + nx2.to_i.to_s + ',' + ny2.to_i.to_s
      first = false
      # we need to find an origin; find northwestern-most point
      coordinates = coordinates+' -gcp '+nx2.to_s+', '+ny2.to_s+', '+node.lon.to_s + ', ' + node.lat.to_s
      
      # identify largest dimension to set canvas size for ImageMagick:
      maxdimension = nx1.to_i if maxdimension < nx1.to_i
      maxdimension = ny1.to_i if maxdimension < ny1.to_i
      maxdimension = nx2.to_i if maxdimension < nx2.to_i
      maxdimension = ny2.to_i if maxdimension < ny2.to_i
    end

    # close mask polygon:
    maskpoints = maskpoints + ' '
      nx2 = -x1+(pxperm*Cartagen.spherical_mercator_lon_to_x(nodes_array.first.lon,scale))
      ny2 = y1-(pxperm*Cartagen.spherical_mercator_lat_to_y(nodes_array.first.lat,scale))
    maskpoints = maskpoints + nx2.to_i.to_s + ',' + ny2.to_i.to_s

    height = (y1-y2).to_i.to_s
    width = (-x1+x2).to_i.to_s

    # http://www.imagemagick.org/discourse-server/viewtopic.php?f=1&t=11319
    # http://www.imagemagick.org/discourse-server/viewtopic.php?f=3&t=8764
    # read about equalization 
    # -equalize
    # -contrast-stretch 0

    imageMagick = "convert "
    imageMagick += "-contrast-stretch 0 "
    imageMagick += local_location+" "
    imageMagick += "-crop "+maxdimension.to_i.to_s+"x"+maxdimension.to_i.to_s+"+0+0! "
    imageMagick += "-flatten "
    imageMagick += "-distort Perspective '"+points+"' "
    imageMagick += "-flatten "
    if width > height
      imageMagick += "-crop "+width+"x"+width+"+0+0\! "
    else
      imageMagick += "-crop "+height+"x"+height+"+0+0\! "
    end
    imageMagick += "+repage "
    imageMagick += completed_local_location
    puts imageMagick
    system(Gdal.ulimit+imageMagick)

    # create a mask (later we can blur edges here)
    imageMagick2 = 'convert +antialias '
    if width > height
      imageMagick2 += "-size "+width+"x"+width+" "
    else
      imageMagick2 += "-size "+height+"x"+height+" "
    end
    # attempt at blurred edges in masking, but I've given up, as gdal_merge doesn't seem to respect variable-opacity alpha channels
    imageMagick2 += ' xc:none -draw "fill black stroke red stroke-width 30 polyline '
    imageMagick2 += maskpoints + '" '
    imageMagick2 += ' -alpha set -channel A -transparent red -blur 0x8 -channel R -evaluate set 0 +channel '+mask_location
    #imageMagick2 += ' xc:none -draw "fill black stroke none polyline '
    #imageMagick2 += maskpoints + '" '
    #imageMagick2 += ' '+mask_location
    puts imageMagick2
    system(Gdal.ulimit+imageMagick2)

    imageMagick3 = 'composite '+mask_location+' '+completed_local_location+' -compose DstIn -alpha Set '+masked_local_location
    puts imageMagick3
    system(Gdal.ulimit+imageMagick3)

    gdal_translate = "gdal_translate -of GTiff -a_srs EPSG:4326 "+coordinates+'  -co "TILED=NO" '+masked_local_location+' '+geotiff_location
    puts gdal_translate
    system(Gdal.ulimit+gdal_translate)
 
    #gdalwarp = 'gdalwarp -srcnodata "255" -dstnodata 0 -cblend 30 -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    gdalwarp = 'gdalwarp -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    puts gdalwarp
    system(Gdal.ulimit+gdalwarp)

    # deletions could happen here; do it in distinct method so we can run it independently
    delete_temp_files(path)

    [x1,y1]
  end

  def get_working_directory(path)
    "public/warps/" + path + "-working/"
  end

  def warps_directory(path)
    "public/warps/" + path + "/"
  end

  def delete_temp_files(path)
    system('rm -r ' + working_directory(path))
    system('rm ' + warps_directory(path) + '*.png')
  end

end
