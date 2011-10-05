class AddZipWarpableResHistory < ActiveRecord::Migration
  def self.up
    add_column :warpables, :history, :text, :default => "", :null => false
    add_column :warpables, :cm_per_pixel, :float, :default => 0, :null => false
    add_column :exports, :zip, :boolean, :default => false, :null => false

    Warpable.find(:all).each do |w|
      r = w.get_cm_per_pixel
      w.cm_per_pixel = r if r != nil
      w.save
    end

  end

  def self.down
    remove_column :warpables, :history
    remove_column :warpables, :cm_per_pixel
    remove_column :exports, :zip
  end
end
