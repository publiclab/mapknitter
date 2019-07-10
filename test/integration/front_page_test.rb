require 'test_helper'

class FrontPageTest < ActionDispatch::IntegrationTest

  test 'new front page' do
    get '/'
    assert_select 'h1', 'MapKnitter'
  end

end
