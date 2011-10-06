class AddMapTileUrl < ActiveRecord::Migration
  def self.up
    add_column :maps, :tile_url, :text, :default => "", :null => false
    add_column :maps, :tile_layer, :text, :default => "", :null => false
  end

  def self.down
    remove_column :maps, :tile_url
    remove_column :maps, :tile_layer
  end
end
