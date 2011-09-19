# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

	def admin
		APP_CONFIG["password"] == params[:password]
	end

end
