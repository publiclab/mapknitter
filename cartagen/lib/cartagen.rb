class Cartagen

  def self.chop_word(string)
    word = string.split(' ')[0]
    string.slice!(word+' ')
    word
  end
  
  # collects coastline ways into collected_way relations;
  # see  http://wiki.openstreetmap.org/wiki/Relations/Proposed/Collected_Ways
  def self.collect_ways(features)
    collected_ways = []
    nodes = {}
    features['osm']['node'].each do |node|
      nodes[node['id']] = node
    end
    features['osm']['way'].each do |way|
      if way['tag']
        coastline = false
        way['tag'].each do |tag|
          if tag['k'] == 'natural' && tag['v'] == 'coastline'
            coastline = true
            break
          end
        end
        if coastline
          relation = {}
          relation['way'] = []
          relation['way'] << way
          # are a way's nodes ordered? yes.
          # check each way to see if it has a first or last node in common with 'way'
          features['osm']['way'].each do |subway|
            if subway['nd'].first['ref'] == nodes[way['nd'].first['ref']] || subway['nd'].first['ref'] == nodes[way['nd'].last['ref']] || subway['nd'].last['ref'] == nodes[way['nd'].first['ref']] || subway['nd'].last['ref'] == nodes[way['nd'].last['ref']]
              # we have a match!
              
              
              
              break
            end
          end
        end
      end
    end
  end

  # def self.parse_message(keyword)
  #   keyword = chop_word(self.text)
  #   if keyword == "line"
  #     # add a 'completed' param to way
  #     way = Way.find(:last,:conditions => {:complete => true, :author => self.author})
  #     if way.nil?
  #       way = Way.new({:complete => true, :author => self.author})
  #     end
  #     coords = GeoHash.decode(chop_word(self.text))
  #   elsif keyword == "find"
  #     # geocode
  #   else
  #     
  #     coords[0]
  #   end
  # 
  #   unless coords.nil?
  #     # save it as a node
  #   end
  # end
    
end