class AddNodeMapId < ActiveRecord::Migration[5.2]
  def self.up
    add_column :nodes, :map_id, :integer, :default => 0
    add_column :ways, :map_id, :integer, :default => 0
  end

  def self.down
    remove_column :nodes, :map_id
    remove_column :ways, :map_id
  end
end
