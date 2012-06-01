class AddUserRoleDefault < ActiveRecord::Migration
  def self.up
    change_column_default(:users, :role, "basic")
  end

  def self.down
    change_column_default(:users, :role, "")
  end
end
