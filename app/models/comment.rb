class Comment < ApplicationRecord
  belongs_to :map, optional: true
  belongs_to :user, optional: true

  validates_presence_of :body, :user_id, :map_id

  def author
    User.find(user_id).login
  end
end
