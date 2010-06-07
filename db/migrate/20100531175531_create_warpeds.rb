class CreateWarpeds < ActiveRecord::Migration
  def self.up
    create_table :warpeds do |t|
      t.integer :parent_id
      t.string :content_type
      t.string :filename
      t.string :thumbnail
      t.integer :size
      t.integer :width
      t.integer :height
      t.string :transform_type

      t.timestamps
    end
  end

  def self.down
    drop_table :warpeds
  end
end
