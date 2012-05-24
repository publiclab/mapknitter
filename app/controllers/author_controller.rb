class AuthorController < ApplicationController

	def show
		@maps = Map.find_all_by_author params[:id]
    		@maps = @maps.paginate :page => params[:page], :per_page => 24
		render :layout => 'map'
	end

	def list
		@maps = Map.find :all
		if APP_CONFIG["password"] != params[:password]
			redirect_to "/" 
		else 
			render :layout => 'map'
		end
	end

	def emails
		@maps = Map.find :all
		if APP_CONFIG["password"] != params[:password]
			redirect_to "/" 
		else 
			emails = []
			@maps.each do |map|
				emails << map.email
			end
			emails = emails.uniq
			render :text => emails.join(','), :template => false
		end
	end

end
