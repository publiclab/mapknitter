class AddSlugFieldToMaps < ActiveRecord::Migration[5.2]
  def change
    # There are some duplicate maps, but none have images, so we can delete dupes that don't have images. 
    dupes = []
    Map.all.each do |map|
      dupes << map if Map.find_all_by_name(map.name).length > 1
    end
    dupes.each do |map|
      map.delete if map.warpables.length == 0
    end

    add_column :maps, :slug, :string
    add_index :maps, :slug, unique: true
  end
end
