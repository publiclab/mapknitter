class UsersController < ApplicationController
  # Be sure to include AuthenticationSystem in Application Controller instead
  include AuthenticatedSystem

  def index
    if logged_in?
      @users = User.find :all
    else
      flash[:error] = "You must log in to view that page."
      redirect_to "/login"
    end
  end
  
  def profile
    params[:id] = current_user.login if logged_in? && params[:id] == 0
    @user = User.find_by_login(params[:id])
    @maps = @user.maps
    @maps = @maps.paginate :page => params[:page], :per_page => 24
  end

  def dashboard
    if logged_in?
      @maps = Map.find_all_by_user_id(current_user.id)
      @maps = @maps.paginate :page => params[:page], :per_page => 24
    else
      flash[:error] = "You must be logged in to see your dashboard."
      redirect_to "/login"
    end
  end

  # render new.rhtml
  def new
    @user = User.new
  end
 
  def create
    logout_keeping_session!
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
            # Protects against session fixation attacks, causes request forgery
      # protection if visitor resubmits an earlier form using back
      # button. Uncomment if you understand the tradeoffs.
      # reset session
      self.current_user = @user # !! now logged in
      redirect_back_or_default('/')
      flash[:notice] = "Thanks for signing up!  We're sending you an email with your activation code."
    else
      flash[:error]  = "We couldn't set up that account, sorry.  Please try again, or contact an admin (link is above)."
      render :action => 'new'
    end
  end
end
