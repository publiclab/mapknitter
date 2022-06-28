class ApplicationController < ActionController::Base
  # include OpenIdAuthentication # shouldn't be necessary!!
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper :all # include all helpers, all the time

  before_action :current_user
  helper_method :logged_in?, :current_location

  before_action :set_paper_trail_whodunnit

  def user_for_paper_trail
    # Save the user responsible for the action
    logged_in? ? current_user.id : 'Anonymous'
  end

  def current_user
    user_id = session[:user_id]
    if user_id
      begin
        u = User.find(user_id)
        cookies.signed["user_id"] = u.id
        @user = u
      rescue StandardError
        @user = nil
      end
    else
      @user = nil
    end
  end

  private

  def current_location
    session[:lat].present? && session[:lon].present?
  end

  def require_login
    unless logged_in?
      path_info = request.env['PATH_INFO']
      flash[:warning] = 'You must be logged in to access this section'
      redirect_to('/login?back_to=' + path_info.to_param) # halts request cycle
    end
  end

  def logged_in?
    current_user ? true : false
  rescue StandardError
    false
  end

  def logged_in_as(roles, action)
    unless current_user && roles.any? { |role| current_user.role == role }
      flash[:error] = "Only #{roles.collect { |role| role.pluralize }.join(' and ')} can #{action}."
      redirect_to('/' + '?_=' + Time.now.to_i.to_s)
    end
  end

  def save_tags(map)
    return unless params[:tags].present?

    params[:tags].tr(' ', ',').split(',').each do |tagname|
      map.add_tag(tagname.strip, current_user)
    end
  end
end
