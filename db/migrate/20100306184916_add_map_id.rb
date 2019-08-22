class AddMapId < ActiveRecord::Migration[5.2]
  def self.up
    add_column :warpables, :map_id, :integer, :default => 0
  end

  def self.down
    remove_column :warpables, :map_id
  end
end
