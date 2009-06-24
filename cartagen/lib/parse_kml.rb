gem "httparty"
require "httparty"

class ParseKml
  include HTTParty
  format :xml

  def self.parse(url)
    kml = self.get(url)
    points = {}
    kml['kml']['Document']['Placemark'].each do |point|
      # parse the point
    end
  end
end