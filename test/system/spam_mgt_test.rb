require "application_system_test_case"

class SpamMgtTest < ApplicationSystemTestCase
  def setup
    @banned_user = User.create({
      login: Faker::Internet.username,
      name: Faker::Name.name,
      email: Faker::Internet.email,
      status: User::Status::BANNED
    })
    @admin = User.create({
      login: Faker::Internet.username,
      name: Faker::Name.name,
      email: Faker::Internet.email,
      role: 'admin'
    })
    @spammed_map = Map.create(
      name: Faker::Address.city,
      lat: Faker::Address.latitude,
      lon: Faker::Address.longitude,
      location: Faker::Address.country,
      description: Faker::Lorem.sentence,
      slug: Faker::Lorem.word,
      user: @banned_user,
      author: @banned_user.login,
      status: Map::Status::BANNED
    )
  end

  test "admin view of spammed maps and banned users" do

    #log in 
    page.set_rack_session(user_id: @admin.id)

    #visit a spammed map
    visit "/map/#{@spammed_map.slug}"

    #verify map is not published
    page.assert_selector("span", text: "UNPUBLISHED")

    #find and go to map owner's profile page
    find_link("#{@spammed_map.author}").click()

    #verify user is banned
    page.assert_selector('div.alert', text: 'This author has been banned')
    banner_text = find('small').text
    assert banner_text.include?('Banned')

    # fill_in('map_name', with: 'New Haven Map')

    # fill_in('map_location', with: 'New Haven')

    # assert_selector('.ui-menu-item', text: 'New Haven, CT, USA') # if geocoding works

    # # expect at least one result
    # assert page.evaluate_script("$('.ui-menu-item').length >= 1")
    
    # find('.ui-menu-item').click

    # click_on "Create map"

    # assert_selector('h3#map_title', text: "New Haven Map")
    
    # assert page.evaluate_script("parseInt($('#map_lat').val()) == 41")
    # assert page.evaluate_script("parseInt($('#map_lon').val()) == -72")
  end

end