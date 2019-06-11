class Exporter

  def self.ulimit
    # use ulimit to restrict to 7200 CPU seconds and 5gb virtual memory, and 5gB file storage:
    #"ulimit -t 7200 && ulimit -v 5000000 && ulimit -f 5000000 && "
    "ulimit -t 14400 && ulimit -v 5000000 && ulimit -f 10000000 && nice -n 19 "
  end

  def self.get_working_directory(path)
    "public/warps/" + path + "-working/"
  end

  def self.warps_directory(path)
    "public/warps/" + path + "/"
  end

  def self.delete_temp_files(path)
    system('rm -r ' + get_working_directory(path))
    system('rm ' + warps_directory(path) + '*.png')
  end

  ########################
  ## Run on each image:

  # pixels per meter = pxperm 
  def self.generate_perspectival_distort(pxperm, path, nodes_array, id, image_file_name, image, height, width)
    require 'net/http'
    
    # everything in -working/ can be deleted; 
    # this is just so we can use the files locally outside of s3
    working_directory = get_working_directory(path)
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
    system(self.ulimit+imageMagick)

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
    system(self.ulimit+imageMagick2)

    imageMagick3 = 'composite '+mask_location+' '+completed_local_location+' -compose DstIn -alpha Set '+masked_local_location
    puts imageMagick3
    system(self.ulimit+imageMagick3)

    gdal_translate = "gdal_translate -of GTiff -a_srs EPSG:4326 "+coordinates+'  -co "TILED=NO" '+masked_local_location+' '+geotiff_location
    puts gdal_translate
    system(self.ulimit+gdal_translate)
 
    #gdalwarp = 'gdalwarp -srcnodata "255" -dstnodata 0 -cblend 30 -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    gdalwarp = 'gdalwarp -of GTiff -t_srs EPSG:4326 '+geotiff_location+' '+warped_geotiff_location
    puts gdalwarp
    system(self.ulimit+gdalwarp)

    # deletions could happen here; do it in distinct method so we can run it independently
    delete_temp_files(path)

    [x1,y1]
  end

  ########################
  ## Run on maps:

  # distort all warpables, returns upper left corner coords in x,y
  def self.distort_warpables(scale, warpables, export, slug)

    puts '> generating geotiffs of each warpable in GDAL'
    lowest_x=0
    lowest_y=0
    warpable_coords = []
    current = 0
    warpables.each do |warpable|
     current += 1

     ## TODO: refactor to generate static status file:
     export.status = 'warping '+current.to_s+' of '+warpables.length.to_s
     puts 'warping '+current.to_s+' of '+warpables.length.to_s
     export.save
     ## 

     my_warpable_coords = warpable.generate_perspectival_distort(scale,slug)
     puts '- '+my_warpable_coords.to_s
     warpable_coords << my_warpable_coords
     lowest_x = my_warpable_coords.first if (my_warpable_coords.first < lowest_x || lowest_x.zero? )
     lowest_y = my_warpable_coords.last if (my_warpable_coords.last < lowest_y || lowest_y.zero? )
    end
    [lowest_x,lowest_y,warpable_coords]
  end

  # generate a tiff from all warpable images in this set
  def self.generate_composite_tiff(coords, origin, placed_warpables, slug, ordered)
    directory = "public/warps/"+slug+"/"
    composite_location = directory+slug+'-geo.tif'
    geotiffs = ''
    minlat = nil
    minlon = nil
    maxlat = nil
    maxlon = nil
    placed_warpables.each do |warpable|
      warpable.nodes_array.each do |n|
        minlat = n.lat if minlat == nil || n.lat < minlat
        minlon = n.lon if minlon == nil || n.lon < minlon
        maxlat = n.lat if maxlat == nil || n.lat > maxlat
        maxlon = n.lon if maxlon == nil || n.lon > maxlon
      end
    end
    first = true
    if ordered != true
      # sort by area; this would be overridden by a provided order
      warpables = placed_warpables.sort{|a,b|b.poly_area <=> a.poly_area}
    end
    warpables.each do |warpable|
      geotiffs += ' '+directory+warpable.id.to_s+'-geo.tif'
      if first
        gdalwarp = "gdalwarp -s_srs EPSG:3857 -te "+minlon.to_s+" "+minlat.to_s+" "+maxlon.to_s+" "+maxlat.to_s+" "+directory+warpable.id.to_s+'-geo.tif '+directory+slug+'-geo.tif'
        first = false
      else
        gdalwarp = "gdalwarp "+directory+warpable.id.to_s+'-geo.tif '+directory+slug+'-geo.tif'
      end
      puts gdalwarp
      system(self.ulimit+gdalwarp)
    end
    composite_location
  end

  # generates a tileset at root/public/tms/<slug>/
  # root is something like https://mapknitter.org
  def self.generate_tiles(key, slug, root)
    key = "AIzaSyAOLUQngEmJv0_zcG1xkGq-CXIPpLQY8iQ" if key.blank?
    gdal2tiles = 'gdal2tiles.py -k --s_srs EPSG:4326 -t "'+slug+'" -g "'+key+'" '+root+'/public/warps/'+slug+'/'+slug+'-geo.tif '+root+'/public/tms/'+slug+"/"
    puts gdal2tiles
    system(self.ulimit+gdal2tiles)
  end

  # zips up tiles at root/public/tms/<slug>.zip;
  def self.zip_tiles(slug)
    rmzip = 'cd public/tms/ && rm '+slug+'.zip && cd ../../'
    system(rmzip)
    zip = 'cd public/tms/ && ' + self.ulimit + 'zip -rq '+slug+'.zip '+slug+'/ && cd ../../'
    system(zip)
  end

  # generates a tileset at root/public/tms/<slug>/
  def self.generate_jpg(slug, root)
    imageMagick = 'convert -background white -flatten '+root+'/public/warps/'+slug+'/'+slug+'-geo.tif '+root+'/public/warps/'+slug+'/'+slug+'.jpg'
    system(self.ulimit+imageMagick)
  end

  # runs the above map functions while maintaining a record of state in an Export model;
  # we'll be replacing the export model state with a flat status file
  def self.run_export(user,resolution,export,id,slug,root,average_scale,placed_warpables,key)
    begin
      export.user_id = user.id if user
      export.status = 'starting'
      export.tms = false
      export.geotiff = false
      export.zip = false
      export.jpg = false
      export.save

      directory = "#{root}/public/warps/"+slug+"/"
      stdin, stdout, stderr = Open3.popen3('rm -r '+directory.to_s)
      puts stdout.readlines
      puts stderr.readlines
      stdin, stdout, stderr = Open3.popen3("rm -r #{root}/public/tms/#{slug}")
      puts stdout.readlines
      puts stderr.readlines

      puts '> averaging scales; resolution: ' + resolution.to_s
      pxperm = 100/(resolution).to_f || average_scale # pixels per meter
      puts '> scale: ' + pxperm.to_s + 'pxperm'

      puts '> distorting warpables'
    
      origin = self.distort_warpables(pxperm, placed_warpables, export, slug)
      warpable_coords = origin.pop

      export.status = 'compositing'
      export.save

      puts '> generating composite tiff'
      composite_location = self.generate_composite_tiff(warpable_coords,origin,placed_warpables,slug,false) # no ordering yet

      info = (`identify -quiet -format '%b,%w,%h' #{composite_location}`).split(',')
      puts info

      if info[0] != ''
        export.geotiff = true
        export.size = info[0]
        export.width = info[1]
        export.height = info[2]
        export.cm_per_pixel = 100.0000/pxperm
        export.status = 'tiling'
        export.save
      end

      puts '> generating tiles'
      export.tms = true if self.generate_tiles(key, slug, root)
      export.status = 'zipping tiles'
      export.save

      puts '> zipping tiles'
      export.zip = true if self.zip_tiles(slug)
      export.status = 'creating jpg'
      export.save

      puts '> generating jpg'
      export.jpg = true if self.generate_jpg(slug, root)
      export.status = 'complete'
      export.save

    rescue SystemCallError => e
      puts "ERROR"
      puts e.inspect
      puts "END ERROR"
      export.status = 'failed'
      export.save
    end
    return export.status
  end

end
