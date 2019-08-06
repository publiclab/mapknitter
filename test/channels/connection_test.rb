require 'test_helper'
require 'byebug'

module ApplicationCable
  class ConnectionTest < ActionCable::Connection::TestCase
    def test_connection_with_user
      cookies.signed["user_id"] = users(:chris)

      #this simulates the connection
      connect

      # assert connected user
      assert_equal "chris", connection.current_user.login
    end

    def test_does_not_connect_without_user

      # user not logged in
      begin
        # trying to connect but fails
        connect
      rescue Exception=>e

        #compare the error class
        assert_equal e.class, ActionCable::Connection::Authorization::UnauthorizedError
      end

      #check is connection is nil(which it  should be)
      assert_equal nil, connection
    end
  end
end
