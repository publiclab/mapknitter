class ExportController < ApplicationController

	# http://mapknitter.org/warps/yale-farm/yale-farm.jpg
	def jpg
		send_file 'public/warps/'+params[:id]+'/'+params[:id]+'.jpg'
	end

	# http://mapknitter.org/warps/yale-farm/yale-farm-geo.tif
	def geotiff
		send_file 'public/warps/'+params[:id]+'/'+params[:id]+'-geo.tif'
	end

end
