require 'uri'

# This controller handles the login/logout function of the site.  
class SessionsController < ApplicationController
  #protect_from_forgery :except => [:create]

  @@openid_url_base  = "https://publiclab.org/people/"
  @@openid_url_suffix = "/identity"

  # render new.erb.html
  def new #login
    if logged_in?
      redirect_to "/"
    else
      @referer = params[:back_to]  
    end
  end

  def create #new
    back_to = params[:back_to]
    open_id = params[:open_id]
    openid_url = URI.decode(open_id)
    #possibly user is providing the whole URL
    if openid_url.include? "publiclab"
      if openid_url.include? "http"
        url = openid_url
      end
    else 
      url = @@openid_url_base + openid_url + @@openid_url_suffix
    end
    openid_authentication(url, back_to)
  end

  # only on local installations, to bypass OpenID; add "local: true" to config/config.yml
  # this makes offline development possible; like on a plane! but do NOT leave it open on a production machine
  def local
    if APP_CONFIG["local"] == true && @current_user = User.find_by_login(params[:login])
      successful_login '', nil 
    else
      flash[:error] = "Forbidden"
      redirect_to "/"
    end
  end

  def failed_login(message = "Authentication failed.")
    flash[:danger] = message
    redirect_to '/'
  end

  def successful_login(back_to, id)
    session[:user_id] = @current_user.id
    flash[:success] = "You have successfully logged in."
    if id
      redirect_to '/sites/' + id.to_s + '/upload'
    else
      if back_to 
        redirect_to back_to 
      else
        redirect_to '/sites'
      end
    end
  end

  def logout
    session[:user_id] = nil 
    flash[:success] = "You have successfully logged out."
    redirect_to '/'
  end

  protected

  def openid_authentication(openid_url, back_to)
    #puts openid_url
    authenticate_with_open_id(openid_url, :required => [:nickname, :email]) do |result, identity_url, registration|
      if result.successful?
        @user = User.find_by_identity_url(identity_url)
        if not @user
          @user = User.new
          @user.login = registration['nickname']
          @user.email = registration['email']
          @user.identity_url = identity_url
          begin 
            @user.save!
          rescue ActiveRecord::RecordInvalid => invalid
            puts invalid
            failed_login "User can not be associated to local account. Probably the account already exists with different capitalization!" 
            return
          end
        end
        nonce = params[:n]
        if nonce 
          tmp = Sitetmp.find_by nonce: nonce
          if tmp 
            data = tmp.attributes
            data.delete("nonce")
            site = Site.new(data)
            site.save
            tmp.destroy
          end
        end
        @current_user = @user
        if site
          successful_login back_to, site.id
        else
          successful_login back_to, nil 
        end
      else
        failed_login result.message
        return false
      end
    end
  end

end
