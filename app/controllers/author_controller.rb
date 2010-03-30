class AuthorController < ApplicationController

	def show
		@maps = Map.find_all_by_author params[:id]
		render :layout => 'map'
	end

end
