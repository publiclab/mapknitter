class ChangeOpenidIdentityUrls < ActiveRecord::Migration[5.2]
  def up
    User.all.each do |u|
      # if it matches http://publiclaboratory.org/...
      if u.identity_url != "" && !u.identity_url.nil? && u.identity_url[0..26] == "http://publiclaboratory.org"
        u.identity_url = "http://publiclab.org/openid/"+ u.login.downcase
        puts " => "+ u.identity_url
        u.save
      end
    end
  end

  def down
  end
end
