# Filters added to this controller apply to all controllers in the application.
# Likewise, all the methods added will be available for all controllers.
require_dependency 'password'

include AuthenticatedSystem

class ApplicationController < ActionController::Base
  helper :all # include all helpers, all the time

  before_filter :store_location

  # See ActionController::RequestForgeryProtection for details
  # Uncomment the :secret if you're not using the cookie session store
  protect_from_forgery # :secret => 'e60163cd72d897fd0ae06095d71acfbc'
  
  # See ActionController::Base for details 
  # Uncomment this to filter the contents of submitted sensitive data parameters
  # from your application log (in this case, all fields with names like "password"). 
  filter_parameter_logging :password

  def require_user
    unless current_user
      flash[:notice] = "You must be logged in to access this page"
      redirect_to login_url
      return false
    end
  end
  
  def store_location
    if (controller_name != "sessions")
      session[:return_to] = request.fullpath
    end
  end  
end
