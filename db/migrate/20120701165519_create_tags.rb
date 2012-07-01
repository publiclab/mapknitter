class CreateTags < ActiveRecord::Migration
  def self.up
    create_table :tags do |t|
      t.string :user_id
      t.string :name
      t.integer :map_id
      t.integer :warpable_id

      t.timestamps
    end
  end

  def self.down
    remove_table :tags
  end
end
