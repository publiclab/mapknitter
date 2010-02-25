gem "httparty"
require "httparty"

# Required to serve kml files:
Mime::Type.register "text/kml", :kml

class Xapi
  include HTTParty
  # base_uri 'osmxapi.hypercube.telascience.org/api/0.6'
  base_uri 'www.informationfreeway.org/api/0.6/'
  
  def self.tag(left,bottom,right,top,key,value)
    bbox = left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s
    options = { :query => { :bbox => bbox } }
    puts bbox
    # query = '%2A%5b'+key+'='+value+'%5d%5bbbox='+bbox+"%5d"
    query = '/way%5b'+key+'='+value+'%5d%5bbbox='+bbox+'%5d'
    # query = 'map?type='+key+'&value='+value+'&bbox='+left.to_s+","+bottom.to_s+","+right.to_s+","+top.to_s
    features = self.get(query)
  end
end