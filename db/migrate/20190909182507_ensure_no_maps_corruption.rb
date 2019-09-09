class EnsureNoMapsCorruption < ActiveRecord::Migration[5.2]
  def self.up
    remove_column :maps, :styles
    remove_column :maps, :description
    remove_column :maps, :tile_url
    remove_column :maps, :tile_layer
    add_column :maps, :description, :text
    add_column :maps, :styles, :text
    add_column :maps, :tile_url, :text
    add_column :maps, :tile_layer, :text

  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
