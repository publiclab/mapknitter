class ChangeMapNull < ActiveRecord::Migration[5.2]
  def up
    change_column_null :maps, :tile_url,   true
    change_column_null :maps, :tile_layer, true
  end

  def down
    change_column_null :maps, :tile_url,   false
    change_column_null :maps, :tile_layer, false
  end
end
