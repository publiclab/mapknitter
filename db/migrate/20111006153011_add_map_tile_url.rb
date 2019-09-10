class AddMapTileUrl < ActiveRecord::Migration[5.2]
  def self.up
    add_column :maps, :tile_url, :text, :null => false
    add_column :maps, :tile_layer, :text, :null => false
  end

  def self.down
    remove_column :maps, :tile_url
    remove_column :maps, :tile_layer
  end
end
