require "application_system_test_case"

class ImagesTest < ApplicationSystemTestCase
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

    #log in 
    page.set_rack_session(user_id: @user.id)

    visit "/maps/#{@map.slug}"
    click 'Images'

    #expect layers to not have an ldi instance before placing
    assert !page.evaluate_script(check_if_image_placed)

    assert_selector('.btn-sm', text: 'Place')
    find("a.add-image-#{@map.warpables.first.id}").click

    #expect layers to have an ldi instance after placing
    assert page.evaluate_script(check_if_image_placed)
  end

  def check_if_image_placed
    "(function a(){
      var layers = map._layers;
      for (var k in layers) {
        if (layers[k] instanceof L.DistortableImageOverlay) { 
          return true;
          }
        }
      return false;
    }());"
  end
end
