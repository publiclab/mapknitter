class Comment < ActiveRecord::Base

  #attr_accessible :user_id, :body

  belongs_to :map
  belongs_to :user

  validates_presence_of :body, :user_id, :map_id

  def author
    User.find(self.user_id).login
  end
end
