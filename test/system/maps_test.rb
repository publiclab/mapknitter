require "application_system_test_case"

class MapsTest < ApplicationSystemTestCase
  def setup
    @user = User.create({login: Faker::Internet.username,
                     name: Faker::Name.name,
                     email: Faker::Internet.email})
    # @map = Map.create(
    #     name: Faker::Address.city,
    #     lat: Faker::Address.latitude,
    #     lon: Faker::Address.longitude,
    #     location: Faker::Address.country,
    #     description: Faker::Lorem.sentence,
    #     slug: Faker::Lorem.word,
    #     user: @user,
    #     author: @user.login
    #   )
  end

  test "Map creation form" do

    #log in 
    page.set_rack_session(user_id: @user.id)

    visit "/maps/new"

    # expect at least one result
    assert page.evaluate_script("$('.ui-menu-item').length == 0")

    fill_in('map_name', with: 'New Haven Map')

    fill_in('map_location', with: 'New Haven')

    assert_selector('.ui-menu-item', text: 'New Haven, CT, USA') # if geocoding works

    # expect at least one result
    assert page.evaluate_script("$('.ui-menu-item').length >= 1")

    click_on "Create map"

    assert_selector('h3#map_title', text: "New Haven Map")
    
    assert page.evaluate_script("parseInt($('#map_lat').val()) == 41")
    assert page.evaluate_script("parseInt($('#map_lon').val()) == -72")
  end

end
