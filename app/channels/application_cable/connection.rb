module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      reject_unauthorized_connection if cookies.signed["user_id"].nil?
      User.find(cookies.signed["user_id"].id)
    rescue ActiveRecord::RecordNotFound
      reject_unauthorized_connection
    end
  end
end
