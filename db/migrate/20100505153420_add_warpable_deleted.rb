class AddWarpableDeleted < ActiveRecord::Migration[5.2]
  def self.up
    add_column :warpables, :deleted, :boolean, :default => false, :null => false
  end

  def self.down
    remove_column :warpables, :deleted
  end
end
