class Cartagen

  def self.chop_word(string)
    word = string.split(' ')[0]
    string.slice!(word+' ')
    word
  end

  def self.spherical_mercator_lon_to_x(lon,scale_factor=10000)
    (lon) * scale_factor
  end

  def self.spherical_mercator_x_to_lon(x,scale_factor=10000) 
    (x/(scale_factor))
  end

  def self.spherical_mercator_lat_to_y(lat,scale_factor=10000)
    180/Math::PI * Math.log(Math.tan(Math::PI/4+lat*(Math::PI/180)/2)) * scale_factor
  end

  def self.spherical_mercator_y_to_lat(y,scale_factor=10000)
    180/Math::PI * (2 * Math.atan(Math.exp(y/scale_factor*Math::PI/180)) - Math::PI/2)
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

end
