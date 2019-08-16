class CreateAnnotations < ActiveRecord::Migration[5.2]
  def self.up
    create_table :annotations do |t|
      t.integer :map_id
      t.integer :user_id
      t.string  :type
      t.string  :text
      t.string  :style
      t.string  :coordinates

      t.timestamps
    end
  end

  def self.down
    drop_table :annotations
  end
end
