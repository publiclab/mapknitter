class UtilityController < ApplicationController

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
