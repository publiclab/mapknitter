class ZoomToFloat < ActiveRecord::Migration[5.2]
  def self.up
    remove_column :maps, :zoom
    add_column :maps, :zoom, :decimal, :precision => 15, :scale => 10, :default => 2
  end

  def self.down
    remove_column :maps, :zoom
    add_column :maps, :zoom, :integer, :default => 2
  end
end
