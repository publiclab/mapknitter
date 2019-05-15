# Fake maps
users = User.all
p 'Now faking Maps....'
maps = []
30.times do
  map = Map.new(
    name: Faker::Address.city,
    lat: Faker::Address.latitude,
    lon: Faker::Address.longitude,
    location: Faker::Address.country,
    description: Faker::Lorem.sentence,
    slug: Faker::Lorem.word
  )
  map.user =  (users.sample)
  map.author = map.user.login
  map.save
  maps. << map
end
p 'Done faking maps...'


# Fake maps images
p 'Adding Warbaples to maps'

maps.each do |map|
  image = map.warpables.new
  image.id  = Faker::Number.unique.between(10, 100)
  image.history =  Faker::Lorem.word
  image.image_file_name =  'demo.png'
  image.width = 500
  image.nodes = '1,3,4,5'
  system("mkdir -p public/system/images/#{image.id}/original")
  system("cp test/fixtures/demo.png public/system/images/#{image.id}/original/demo.png")
  image.image_content_type = 'image/png'
  image.save
end
p  'Done adding images to maps'

