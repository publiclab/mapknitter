class Tag < ApplicationRecord
  belongs_to :map, optional: true
  belongs_to :user, optional: true

  validates_presence_of :name, on: :create, message: "can't be blank"
  validates_presence_of :user_id, on: :create, message: "can't be blank"
  validates_presence_of :map_id, on: :create, message: "can't be blank"

  def maps
    Map.where(id: Tag.where(name: name).collect(&:map_id).uniq)
  end
end
