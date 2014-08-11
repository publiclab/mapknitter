class AddTagIndex < ActiveRecord::Migration
  def self.up
  	add_index :tags, :map_id
  	add_index :tags, :warpable_id
  	add_index :tags, :user_id
  end

  def self.down
  	remove_index :tags, :map_id
  	remove_index :tags, :warpable_id
  	remove_index :tags, :user_id
  end
end
