class WriteController < ApplicationController

  def point
    n = Node.new
    n.color = params[:color]
    n.lat = params[:lat]
    n.lon = params[:lon]
    n.author = params[:author]
    render :text => n.save
  end

end
