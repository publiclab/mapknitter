class ExportController < ApplicationController

	# http://mapknitter.org/warps/yale-farm/yale-farm.jpg
	def jpg
		send_file 'public/warps/'+params[:id]+'/'+params[:id]+'.jpg'
	end

	# http://mapknitter.org/warps/yale-farm/yale-farm-geo.tif
	def geotiff
		send_file 'public/warps/'+params[:id]+'/'+params[:id]+'-geo.tif'
	end

	def mbtiles
		send_file 'public/warps/'+params[:id]+'/'+params[:id]+'.mbtiles'
	end

	def list
		@exports = Export.find :all, :conditions => ['status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?',(DateTime.now-24.hours).to_s(:db)]
		render :layout => "map"
	end

end
