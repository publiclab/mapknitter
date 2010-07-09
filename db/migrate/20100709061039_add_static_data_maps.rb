class AddStaticDataMaps < ActiveRecord::Migration
  def self.up
    add_column :maps, :static_data, :string, :default => ''
  end

  def self.down
    remove_column :maps, :static_data
  end
end
