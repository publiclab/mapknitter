gem "httparty"
require "httparty"
# Required to serve kml files:
Mime::Type.register "text/kml", :kml

class ParseOsm
  include HTTParty
  format :xml

  def self.parse(url)
    self.get(url)
  end
  
  def self.filter(url,tag_query)
    features = self.get(url)
    filtered_nodes = []
    filtered_ways = []
    node_refs = []
    node_count = 0

    features['osm']['way'].each do |way|
      has_tag = false
      if way['tag']
        way['tag'].each do |tag|
          begin
            if tag['v'] == tag_query
              has_tag = true
            elsif tag['k'] == tag_query
              has_tag = true
            end
          rescue
          
          end
        end
      end
      if has_tag
        filtered_ways << way
        node_refs = node_refs + way['nd']
        way['nd'].each do |nd|
          node_count += 1
          node_refs << nd['ref']
        end
      end
    end

    node_refs.uniq!
    node_refs.each do |nd|
      features['osm']['node'].each do |node|
        if nd == node['id']
          filtered_nodes << node
        end
      end
    end
    
    puts node_count.to_s+" node count"
    puts node_refs.length.to_s+" nodes"
    puts filtered_ways.length.to_s+" ways"
    
    # features
    {'osm' => {
      'node' => filtered_nodes,
      'way' => filtered_ways
    }}
  end
  
end
