class AddWarpableLock < ActiveRecord::Migration
  def self.up 
    add_column :warpables, :locked, :boolean, :default => false, :null => false
  end

  def self.down
    remove_column :warpables, :locked
  end
end
