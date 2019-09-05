class AddZipWarpableResHistory < ActiveRecord::Migration[5.2]
  def self.up
    add_column :warpables, :history, :text, :null => false
    add_column :warpables, :cm_per_pixel, :float, :default => 0, :null => false
    add_column :exports, :zip, :boolean, :default => false, :null => false
    # Node.find(:all, :conditions => ["description != ''"]).each do |node|
    Warpable.all.each do |w|
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
