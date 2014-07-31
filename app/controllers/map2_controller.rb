class Map2Controller < ApplicationController
	def show 
		@map = Map.find_by_name(params[:id], :order => 'version DESC')
		render :layout => 'knitter'
	end
end