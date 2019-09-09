require_relative '20141104184417_change_openid_identity_urls'

class EnsureNoUsersCorruption < ActiveRecord::Migration[5.2]
  def self.up
    ChangeOpenidIdentityUrls.up
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
