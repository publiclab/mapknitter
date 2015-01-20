class AddSlugFieldToMaps < ActiveRecord::Migration
  def change
    add_column :maps, :slug, :string
    add_index :maps, :slug, unique: true
  end
end
