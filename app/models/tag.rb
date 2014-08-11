class Tag < ActiveRecord::Base
    validates_presence_of :name, :on => :create, :message => "can't be blank"
    validates_presence_of :user_id, :on => :create, :message => "can't be blank"
    validates_presence_of :map_id, :on => :create, :message => "can't be blank"

    def map
        Map.find self.map_id
    end

    def maps
        tags = Tag.find_all_by_name(self.name)
        maps = []
        tags.each do |tag|
                maps << tag.map_id
        end
        Map.find maps.uniq
    end
end
