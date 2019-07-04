module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private
    def find_verified_user
      if verified_user = User.find_by(id:  session[:user_id])
        return verified_user
      else
        return nil
      end
    end
  end
end