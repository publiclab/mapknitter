gem 'davetroy-geohash'
require 'geohash'

class Message < ActiveRecord::Base
  has_many :keyvalues
  after_create :keyvalues
  
  def keyvalues
    # /(\w+):((?:(?:\w+[,.!]*)+(?: |$))+)/
    # "location:20 Ames St 02139 tag:brown bears"
    # [["location","20 Ames St 02139"],["tag","brown bears"]]
    pairs = self.text.scan(/(\w+):((?:(?:\w+[,.!]*)+(?: |$))+)/)
    pairs.each do |pair|
      keyvalue = Keyvalue.new
      keyvalue.key = pair[0]
      keyvalue.value = pair[1]
      keyvalue.message_id = self.id
      keyvalue.save
    end
  end
  
  def save_as_node
    # mind privacy with regard to phone # => author. maybe gen irreversible hash of #?
    keyword = Cartagen.chop_word(self.text)
    if keyword == "line"
      way = Way.find(:last,:conditions => {:complete => false, :author => self.author})
      if way.nil?
        way = Way.new({:complete => false,:author => self.author})
        way.save
      end
      coords = GeoHash.decode(Cartagen.chop_word(self.text))
    elsif keyword == "end"
      way = Way.find(:last,:conditions => {:complete => false, :author => self.author})
      way.complete = true
      way.save
      coords = GeoHash.decode(Cartagen.chop_word(self.text))
    elsif keyword == "find"
      
    else
      coords = GeoHash.decode(Cartagen.chop_word(self.text))
    end

    # save it as a node
    unless coords.nil?
      n = Node.new
      n.color = 'red'
      n.lat = coords[0]
      n.lon = coords[1]
      n.description = self.text unless self.text.nil?
      # append to way if one exists: 
      n.way_id = way.id unless way.nil?      
      n.author = self.author unless self.nil?
      n.save
    end
  end
  
end
