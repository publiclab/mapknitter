class Cartagen

  def self.chop_word(string)
    word = string.split(' ')[0]
    string.slice!(word+' ')
    word
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