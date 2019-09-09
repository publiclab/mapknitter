class RemoveTextColumnTypeDefaults < ActiveRecord::Migration[5.2]
  def self.up
    change_column_default :warpables, :history, nil
    change_column_default :maps, :styles, nil
    change_column_default :maps, :description, nil
    change_column_default :maps, :tile_layer, nil
    change_column_default :maps, :tile_url, nil
    change_column_default :nodes, :body, nil
    change_column_default :ways, :body, nil
    change_column_default :exports, :bands_string, nil
  end
end
