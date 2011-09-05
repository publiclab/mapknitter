class AddWarpsAdditionalFields < ActiveRecord::Migration
  def self.up
    drop_table :warps
    create_table :exports do |t|
	t.integer :map_id, :default => 0
	t.integer :size, :default => 0
	t.integer :width, :default => 0
	t.integer :height, :default => 0
	t.float :cm_per_pixel, :default => 0
	t.string :status, :default => 'none'
	t.boolean :tms, :default => false
	t.boolean :jpg, :default => false
	t.boolean :geotiff, :default => false

	t.timestamps
    end
  end

  def self.down
    create_table :warps do |t|
      t.integer :map_id
      t.integer :warpable_id
      t.integer :parent_id
      t.string :content_type
      t.string :filename
      t.string :thumbnail
      t.integer :size
      t.integer :width
      t.integer :height

      t.timestamps
    end
  end
end
