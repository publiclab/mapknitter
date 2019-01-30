class UsersController < ApplicationController

  def profile
    params[:id] = current_user.login if logged_in? && params[:id] == 0
    @user = User.find_by_login(params[:id])
    @maps = Map.where(user_id: @user.id)
      .paginate(:page => params[:page], :per_page => 24)
  end

  def index
    @title = "Prolific map authors"
    @users = User.joins(:maps)
      .select("users.*, count(users.id) as maps_count")
      .group("maps.user_id")
      .order("maps_count DESC")
      .paginate(:page => params[:page], :per_page => 24)
    render "users/index"
  end

end
