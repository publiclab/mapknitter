class UtilityController < ApplicationController

  def sorter
    render :file => "public/sorter.html"
  end

  def tms_alt
    # /z/x/y.png
    # /z/x/y.png
    # /z/x/(2*z-y-1).png
    y = 2**params[:z].to_i-params[:y].to_i-1
    puts y
    redirect_to "/tms/#{params[:id]}/#{params[:z]}/#{params[:x]}/#{y}.png"
  end

  def tms_info

  end

  def proxy
    url = URI.parse(params[:url])
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port) {|http|
      http.request(req)
    }
    render :text => res.body
  end
  
  def geocode_sites
    file = File.new("public/sites.txt", "r")
    line = file.gets.chomp!
    sites = []
    while (line) # goes through names in file until it finds one that hasn't been used yet
      begin
        geo = GeoKit::GeoLoc.geocode(line)
      rescue
      end
      if geo
        sites << [line,geo.lat,geo.lng]
      end
      line = file.gets.chomp!
    end
    file.close
    render :json => sites
  end
  
  def geocode
    if params[:location]
      @geo = GeoKit::GeoLoc.geocode(params[:location])
      puts @geo.lat
      render :json => @geo if params[:format] == 'json'
    end
  end

end
