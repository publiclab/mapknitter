class AddWarpMapId < ActiveRecord::Migration
  def self.up
    add_column :warps, :map_id, :integer, :default => 0, :null => false
    add_column :warps, :warpable_id, :integer, :default => 0, :null => false
  end

  def self.down
    remove_column :warps, :map_id
    remove_column :warps, :warpable_id
  end
end
