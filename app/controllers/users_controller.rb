class UsersController < ApplicationController
  helper_method :sort_column, :sort_direction
  
  def profile
    params[:id] = current_user.login if logged_in? && params[:id].zero?
    @user = User.find_by_login(params[:id])
    @maps = Map.where(user_id: @user.id)
               .paginate(page: params[:page], per_page: 24)
  end

  def index
    @title = 'Prolific map authors'
    @users = User.joins(:maps)
                 .select('users.*, count(users.id) as maps_count')
                 .group('maps.user_id')
                 .order(sort_column + ' ' + sort_direction)
                 .paginate(page: params[:page], per_page: 24)
    render 'users/index'
  end

  private
  def sort_column
    params[:sort] || "maps_count"
  end
  
  def sort_direction
    params[:direction] || "desc"
  end

end
