class AnnotationController < ApplicationController

	def create
		if logged_in?
			@note = Node.new(
				:description => params[:description],
				:lat => params[:lat],
				:lon => params[:lon],
				:author => current_user.login
				)
			@note.save!
			render :text => "success!"
		else
			flash[:error] = "You can't do that unless you're logged in."
			redirect_to "/home"
		end
	end

end
