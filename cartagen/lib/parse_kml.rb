require 'net/http'
require 'uri'
gem 'crack'
require 'crack'

class ParseKml
  def self.parse(url)
    kml = Net::HTTP.get URI.parse(url)
		id = kml.hash.to_s + rand(999999999).to_s
    File.open("tmp/gpsbabel/#{id}.kml", 'w') do |f|
			f.write(kml)
		end
		system "gpsbabel -i kml -f tmp/gpsbabel/#{id}.kml -o osm -F tmp/gpsbabel/#{id}.osm"
		osm = IO.read("tmp/gpsbabel/#{id}.osm")
		return Crack::XML.parse(osm)
  end
end