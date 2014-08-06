require 'open3'
class Map2Controller < ApplicationController
	def show 
		@map = Map.find_by_name(params[:id], :order => 'version DESC')

		@map.zoom = 12

		render :layout => 'knitter'
	end
end