class Comment < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  attr_accessible :user_id, :body

  def author
    User.find(self.user_id).login
  end
end
