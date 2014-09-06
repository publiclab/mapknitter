class Annotation < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  serialize :coordinates, Array
  serialize :style, Hash

  def author
    User.find(self.user_id).login
  end
end