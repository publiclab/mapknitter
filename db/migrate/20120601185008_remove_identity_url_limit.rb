class RemoveIdentityUrlLimit < ActiveRecord::Migration[5.2]
  def self.up
    change_column :users, :identity_url, :string, :limit => 255
  end

  def self.down
    change_column :users, :identity_url, :string, :limit => 40
  end
end
