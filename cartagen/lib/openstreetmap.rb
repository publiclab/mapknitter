gem "httparty"
require "httparty"
# Required to serve kml files:
Mime::Type.register "text/kml", :kml

class Openstreetmap
  include HTTParty
  base_uri 'dad.media.mit.edu:3001'
  # base_uri 'xapi.openstreetmap.org'
  # base_uri 'www.informationfreeway.org'
  # base_uri 'osmxapi.hypercube.telascience.org'
  # base_uri 'localhost/~warren/'
  
  def self.features(left,bottom,right,top)
    options = { :query => { :bbox => left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s } }
    puts options[:query][:bbox]
    features = self.get('/api/0.6/map', options)
  end
  
  def self.precision(geo)
    case geo.precision
    when "city": 0.05
    else 1
    end
  end
end