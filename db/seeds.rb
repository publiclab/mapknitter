# Fake users
USERS = []

# basic account
USERS << User.create({login: 'harry', name: 'harry potter', email: 'potter@hogwarts.com'})

# admin account 
u_admin = User.create({login: 'albus', name: 'albus dumbledore', email: 'dumbledore@hogwarts.com'})
u_admin.role = 'admin'
USERS.push(u_admin)

# a few randomized basic accounts to have varied map authors
5.times do
  user = User.create({login: Faker::Internet.username,
                     name: Faker::Name.name,
                     email: Faker::Internet.email})
  USERS.push(user)
end

# Now faking Maps....
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
  map.user =  (USERS.sample)
  map.author = map.user.login
  map.save
  maps. << map
end

# Fake maps images
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


