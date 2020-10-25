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

  def require_user
    unless current_user.present?
      flash[:warning] ||= 'You must be logged in to access this page'
      redirect_to '/login'
      false
    end
    current_user
  end

  def alert_and_redirect_moderated
    return unless current_user.present?

    if @map.author.status == User::Status::BANNED && !(logged_in_as(['admin', 'moderator']))
      flash[:error] = 'Author has been banned'
      redirect_to '/'
    elsif @map.status == Map::Status::MODERATED && (logged_in_as(['admin', 'moderator']))
      flash.now[:warning] = "First-time poster <a href='/profile/#{@node.author.name}'>#{@node.author.name}</a> submitted this #{time_ago_in_words(@node.created_at)} ago and it has not yet been approved by a moderator. <a class='btn btn-default btn-sm' href='/moderate/publish/#{@node.id}'>Approve</a> <a class='btn btn-default btn-sm' href='/moderate/spam/#{@node.id}'>Spam</a>"
    elsif @map.status == Map::Status::MODERATED && current_user&.id == @node.author.id && !flash[:first_time_post]
      flash.now[:warning] = "Thank you for contributing open research, and thanks for your patience while your post is approved by <a href='/wiki/moderation'>community moderators</a> and we'll email you when it is published. In the meantime, if you have more to contribute, feel free to do so."
    elsif @map.author.status == User::Status::MODERATED
      flash.now[:warning] = "The user '#{@node.author.username}' has been placed <a href='https://#{request.host}/wiki/moderators'>in moderation</a> and will not be able to respond to comments."
    end
  end

  def logged_in_as(roles)
    return false unless current_user

    roles.any? {|role| current_user.role == role }
  end

  private

  def current_location
    session[:lat].present? && session[:lon].present?
  end

  def require_login
    unless logged_in?
      path_info = request.env['PATH_INFO']
      flash[:warning] = 'You must be logged in to access this section'
      redirect_to '/login?back_to=' + path_info.to_param # halts request cycle
    end
  end

  def logged_in?
    user_id = session[:user_id]

    begin
      user_id && User.find(user_id) ? true : false
    rescue StandardError
      return false
    end
  end

  def save_tags(map)
    return unless params[:tags].present?

    params[:tags].tr(' ', ',').split(',').each do |tagname|
      map.add_tag(tagname.strip, current_user)
    end
  end
end
