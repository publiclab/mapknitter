class UtilityController < ApplicationController

  # translates TMS formats from one ordering to another
  def tms_alt
    # /z/x/y.png
    # /z/x/y.png
    # /z/x/(2*z-y-1).png
    y = 2**params[:z].to_i-params[:y].to_i-1
    redirect_to "/tms/#{params[:id]}/#{params[:z]}/#{params[:x]}/#{y}.png"
  end

  def tms_info
  end

end
