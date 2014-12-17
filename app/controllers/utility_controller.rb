class UtilityController < ApplicationController

  def tms_alt
    # /z/x/y.png
    # /z/x/y.png
    # /z/x/(2*z-y-1).png
    y = 2**params[:z].to_i-params[:y].to_i-1
    puts y
    redirect_to "/tms/#{params[:id]}/#{params[:z]}/#{params[:x]}/#{y}.png"
  end

  def tms_info
  end

end
