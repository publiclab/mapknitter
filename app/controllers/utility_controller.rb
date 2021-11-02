class UtilityController < ApplicationController
  # TMS redirects now handled mostly in config/routes.rb

  # most export TMS routes are handled in app/views/maps/_cloud_exports.html.erb, but this may catch some too
  # if no static local file exists in format /tms/:id/:z/:x/:y.png, this action handles the request
  def tms
    unless Map.find_by(slug: params[:id]) # if no map with the given slug is found, record_not_found is thrown
      redirect_to("https://mapknitter-exports-warps.storage.googleapis.com/#{params[:id]}/tms/#{params[:z]}/#{params[:x]}/#{params[:y]}.png")
    end
  end
end
