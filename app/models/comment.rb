class Comment < ActiveRecord::Base
	belongs_to :map

	def author
		User.find(self.user_id).login
	end
end