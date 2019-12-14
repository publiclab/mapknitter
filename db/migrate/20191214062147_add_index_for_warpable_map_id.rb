class AddIndexForWarpableMapId < ActiveRecord::Migration
    def up
        add_index "warpables", ["map_id"], :name => "index_warpables_on_map_id"
    end

    def down
        remove_index "warpables", ["map_id"]
    end
end
