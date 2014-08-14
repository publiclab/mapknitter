class Comment < ActiveRecord::Base
	belongs_to :map
	belongs_to :user

	def author
		User.find(self.user_id).login
	end
end