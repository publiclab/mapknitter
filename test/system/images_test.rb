require "application_system_test_case"

class ImagesTest < ApplicationSystemTestCase
# def setup
#   @map = maps(:saugus)
#   @warp = warpables(:one)
#   system('mkdir -p public/warps/saugus-landfill-incinerator-working')
#   system('mkdir -p public/system/images/1/original')
#   system('mkdir -p public/system/images/1/original')
#   system('cp test/fixtures/demo.png public/system/images/1/original/')
#   system('mkdir -p public/warps/saugus-landfill-incinerator')

#   file_location = Rails.root + 'test/fixtures/demo.png'
#   @uploaded_data = Rack::Test::UploadedFile.new(file_location.to_s, 'demo.png', "image/png")
#   PaperTrail.enabled = true
# end
  def setup
    @user = User.create({login: Faker::Internet.username,
                     name: Faker::Name.name,
                     email: Faker::Internet.email})
    @map = Map.create(
        name: Faker::Address.city,
        lat: Faker::Address.latitude,
        lon: Faker::Address.longitude,
        location: Faker::Address.country,
        description: Faker::Lorem.sentence,
        slug: Faker::Lorem.word,
        user: @user,
        author: @user.login
      )

    file_location = Rails.root + 'test/fixtures/demo.png'
    @uploaded_data = Rack::Test::UploadedFile.new(file_location.to_s, 'demo.png', "image/png")
    Warpable.create history: 'none', image: @uploaded_data, map_id: @map.id
  end

  test "Image placing" do
    page.set_rack_session(user_id: @user.id)
    visit "/maps/#{@map.slug}"
    click_link('Images')
    assert_selector('.btn-sm', text: 'Place')
    find("a.add-image-#{@map.warpables.first.id}").click
  end
end
