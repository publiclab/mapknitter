class EnsureNoExportsCorruption < ActiveRecord::Migration[5.2]
  def self.up
    remove_column :exports, :bands_string
    add_column :exports, :bands_string, :text, :null => false
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
