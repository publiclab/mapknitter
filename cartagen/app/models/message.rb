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
    n = Node.new
    n.color = 'red'
    geohash = self.text.split(' ')[0]
    latlon = GeoHash.decode(geohash)
    n.lat = latlon[0]
    n.lon = latlon[1]
    n.author = self.author if self.author
    n.save
  end
  
end
