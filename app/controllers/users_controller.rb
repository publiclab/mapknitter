class UsersController < ApplicationController
  helper_method :sort_column, :sort_direction

  def profile
    params[:id] = current_user.login if logged_in? && params[:id].nil?
    user = User.find_by_login(params[:id])
    maps = Map.where(user_id: user.id, status: Map::Status::NORMAL)
            .paginate(page: params[:page], per_page: 24)
    if (user.status == User::Status::NORMAL)
      @user = user
      @maps = maps
    elsif (user.status == User::Status::BANNED)
      if current_user&.can_moderate?
        flash.now[:error] = 'This author has been banned'
        @user = user
        @maps = maps
      else
        flash[:error] = 'That author has been banned'
        redirect_to('/')
      end
    end
  end

  def index
    @title = 'Prolific map authors'
    @users = User.where(status: User::Status::NORMAL).joins(:maps)
                 .select('users.*, count(users.id) as maps_count')
                 .group('maps.user_id')
                 .order(sort_column + ' ' + sort_direction)
                 .paginate(page: params[:page], per_page: 24)
    render('users/index')
  end

  private

  def sort_column
    params[:sort] || 'maps_count'
  end

  def sort_direction
    params[:direction] || 'desc'
  end

  def user_params
    params.require(:user).permit(:login, :email, :name,
      :password, :password_confirmation)
  end
end
