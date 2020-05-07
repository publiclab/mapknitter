class AddMissingIndices < ActiveRecord::Migration[5.2]
  def up
      add_index "exports", ["map_id"], :name => "index_exports_on_map_id"
      add_index "maps", ["user_id"], :name => "index_maps_on_user_id"
      add_index "maps", ["author"], :name => "index_maps_on_author"
      add_index "comments", ["map_id"], :name => "index_comments_on_map_id"
  end

  def down
      remove_index "exports", ["map_id"]
      remove_index "maps", ["user_id"]
      remove_index "maps", ["author"]
      remove_index "comments", ["map_id"]
  end
end
