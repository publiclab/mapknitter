class AddWarperData < ActiveRecord::Migration[5.2]
  def self.up
    add_column :warpables, :nodes, :string, :default => ''
  end

  def self.down
    remove_column :warpables, :nodes
  end
end
