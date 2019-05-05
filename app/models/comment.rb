class Comment < ActiveRecord::Base

  belongs_to :map
  belongs_to :user

  validates_presence_of :body, :user_id, :map_id

  def author
    User.find(self.user_id).login
  end
end
