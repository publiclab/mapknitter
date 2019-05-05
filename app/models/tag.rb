class Tag < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  validates_presence_of :name, :on => :create, :message => "can't be blank"
  validates_presence_of :user_id, :on => :create, :message => "can't be blank"
  validates_presence_of :map_id, :on => :create, :message => "can't be blank"

  def maps
    Map.where(id: Tag.where(name: name).collect(&:map_id).uniq)
  end
end
