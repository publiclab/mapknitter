class AddVectorsTiles < ActiveRecord::Migration
  def self.up
    add_column :maps, :vectors, :boolean, :default => true, :null => false
    add_column :maps, :tiles, :string, :default => '', :null => false
  end

  def self.down
    remove_column :maps, :vectors
    remove_column :maps, :tiles
  end
end
