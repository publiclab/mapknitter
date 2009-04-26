gem "httparty"
require "httparty"

# Required to serve kml files:
Mime::Type.register "text/kml", :kml

class Openstreetmap
  include HTTParty
  base_uri 'api.openstreetmap.org'
  # base_uri 'xapi.openstreetmap.org'
  # base_uri 'www.informationfreeway.org'
  # base_uri 'osmxapi.hypercube.telascience.org'
  # base_uri 'localhost/~warren/'
  
  def self.features(left,bottom,right,top)
    options = { :query => { :bbox => left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s } }
    puts options[:query][:bbox]
    features = self.get('/api/0.6/map', options)
  end

  # def self.tag(left,bottom,right,top,key,value)
  #   bbox = left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s
  #   options = { :query => { :bbox => bbox } }
  #   puts bbox
  #   query = '/api/0.5/%2A%5b'+key+'='+value+'%5d%5bbbox='+bbox+"%5d"
  #   # query = '/api/0.5/map?type='+key+'&value='+value+'&bbox='+left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s
  #   features = self.get(query)
  # end
  
  def self.precision(geo)
    case geo.precision
    when "city": 0.05
    else 1
    end
  end
end