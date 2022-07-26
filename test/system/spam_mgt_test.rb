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
  end

end
