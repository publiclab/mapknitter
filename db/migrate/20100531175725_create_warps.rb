class CreateWarps < ActiveRecord::Migration[5.2]
  def self.up
    create_table :warps do |t|
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

  def self.down
    drop_table :warps
  end
end
