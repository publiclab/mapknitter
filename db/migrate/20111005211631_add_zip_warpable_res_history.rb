class AddZipWarpableResHistory < ActiveRecord::Migration
  def self.up
    add_column :warpables, :history, :text, :default => "", :null => false
    add_column :warpables, :cm_per_pixel, :float, :default => 0, :null => false
    add_column :exports, :zip, :float, :default => false, :null => false
  end

  def self.down
    remove_column :warpables, :history
    remove_column :warpables, :cm_per_pixel
    remove_column :exports, :zip
  end
end
