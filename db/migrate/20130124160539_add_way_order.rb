class AddWayOrder < ActiveRecord::Migration
  def self.up
    add_column :nodes, :way_order, :integer, :default => 0
  end

  def self.down
    remove_column :nodes, :way_order
  end
end
