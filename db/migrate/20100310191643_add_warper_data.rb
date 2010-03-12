class AddWarperData < ActiveRecord::Migration
  def self.up
    add_column :warpables, :nodes, :string, :default => ''
    add_column :warpables, :map_id, :integer, :default => 0
  end

  def self.down
    remove_column :warpables, :nodes
    remove_column :warpables, :map_id
  end
end
