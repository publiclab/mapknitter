class ChangeOpenidIdentityUrls < ActiveRecord::Migration
  def up

    users = User.find :all
    users.each do |user|
      # if it matches http://publiclaboratory.org/...
      if user.identity_url != "" && !user.identity_url.nil? && user.identity_url[0..26] == "http://publiclaboratory.org"
        user.identity_url = "http://publiclab.org/openid/"+user.login.downcase
        puts " => "+user.identity_url
        user.save
      end
    end

  end

  def down
  end
end
