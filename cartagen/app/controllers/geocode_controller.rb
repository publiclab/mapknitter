class GeocodeController < ApplicationController
  
  def list
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
  
end