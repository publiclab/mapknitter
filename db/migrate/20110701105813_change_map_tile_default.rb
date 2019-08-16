class ChangeMapTileDefault < ActiveRecord::Migration[5.2]
  def self.up
    change_column_default(:maps, :tiles, "google")
  end

  def self.down
    change_column_default(:maps, :tiles, "")
  end
end
