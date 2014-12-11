class Tag < ActiveRecord::Base
  attr_accessible :name, :map_id, :user_id

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :map_id, :on => :create, :message => "can't be blank"

  def map
    Map.find self.map_id
  end

  def maps
    Map.find(Tag.find_all_by_name(self.name).collect(&:map_id).uniq)
  end
end
