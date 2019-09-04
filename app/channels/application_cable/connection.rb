module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      User.find(cookies.signed["user_id"])
    rescue ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end
