require 'cgi'

# This controller handles the login/logout function of the site.
class SessionsController < ApplicationController
  # protect_from_forgery :except => [:create]

  def new
    if logged_in?
      redirect_to "/"
    else
      @referer = params[:back_to]
    end
  end

  def create
    @openid_url_base = "https://publiclab.org/people/"
    @openid_url_suffix = "/identity"
    back_to = params[:back_to]
    # we pass a temp username; on line 75 it'll be overwritten by the real one in PublicLab.org's response:
    open_id = "x"
    openid_url = CGI.unescape(open_id)
    # here it is localhost:3000/people/admin/identity for admin
    # possibly user is providing the whole URL
    if openid_url.include? "publiclab"
      if openid_url.include? "http"
        # params[:subaction] contains the value of the provider
        # provider implies ['github', 'google_oauth2', 'twitter', 'facebook']
        url = if params[:subaction]
                # provider based authentication
                openid_url + "/" + params[:subaction]
              else
                # form based authentication
                openid_url
              end
      end
    else
      url = if params[:subaction]
              # provider based authentication
              @openid_url_base + openid_url + @openid_url_suffix + "/" + params[:subaction]
            else
              # form based authentication
              @openid_url_base + openid_url + @openid_url_suffix
            end
    end
    openid_authentication(url, back_to)
  end

  # only on local installations, to bypass OpenID; add "local: true" to config/config.yml
  # this makes offline development possible; like on a plane! but do NOT leave it open on a production machine
  def local
    if APP_CONFIG["local"] && @current_user = User.find_by_login(params[:login])
      successful_login('', nil)
    else
      flash[:error] = "Forbidden"
      redirect_to "/"
    end
  end

  def logout
    session[:user_id] = nil
    flash[:success] = "You have successfully logged out."
    redirect_to '/' + '?_=' + Time.now.to_i.to_s
  end

  protected

  def openid_authentication(openid_url, back_to)
    # puts openid_url
    authenticate_with_open_id(openid_url, required: %i(nickname email fullname)) do |result, identity_url, registration|
      dummy_identity_url = identity_url
      dummy_identity_url = dummy_identity_url.split('/')
      if dummy_identity_url.include?('github') || dummy_identity_url.include?('google_oauth2') || dummy_identity_url.include?('facebook') || dummy_identity_url.include?('twitter')
        identity_url = dummy_identity_url[0..-2].join('/')
      end
      # we splice back in the real username from PublicLab.org's response
      identity_url = identity_url.split('/')[0..-2].join('/') + '/' + registration['nickname']
      if result.successful?
        @user = User.find_by_identity_url(identity_url)
        unless @user
          @user = User.new
          @user.login = registration['nickname']
          @user.email = registration['email']
          @user.identity_url = identity_url

          hash = registration['fullname'].split(':')
          @user.role = hash[1].split('=')[1]
          begin
            @user.save!
          rescue ActiveRecord::RecordInvalid => e
            puts e
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

  private

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
end
