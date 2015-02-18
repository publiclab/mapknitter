class UsersController < ApplicationController

  def profile
    params[:id] = current_user.login if logged_in? && params[:id] == 0
    @user = User.find_by_login(params[:id])
    @maps = Map.where(user_id: @user.id).paginate(:page => params[:page], :per_page => 24)
    render :layout => 'application2'
  end

end
