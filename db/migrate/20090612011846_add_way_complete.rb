class AddWayComplete < ActiveRecord::Migration[5.2]
  def self.up
    add_column :ways, :complete, :boolean, :default => true
  end

  def self.down
    remove_column :ways, :complete
  end
end
