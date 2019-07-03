# frozen_string_literal: true

require 'test_helper'

class UtilityControllerTest < ActionController::TestCase
  test 'should translate tms format' do
    get(:tms_alt,
        params: {
          id: 1,
          x: 10,
          y: 30,
          z: 40
        }
       )

    y = 2**40.to_i - 30.to_i - 1
    assert_redirected_to "/tms/1/40/10/#{y}.png"
  end
end
