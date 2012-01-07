class AddExportTypeBands < ActiveRecord::Migration
  def self.up
    add_column :exports, :bands_string, :text, :default => "", :null => false
    add_column :exports, :export_type, :string, :default => "normal", :null => false
  end

  def self.down
    remove_column :exports, :bands_string
    remove_column :exports, :export_type
  end
end
