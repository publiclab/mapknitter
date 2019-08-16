class AddLicense < ActiveRecord::Migration[5.2]
  def self.up
    add_column :maps, :license, :string, :default => 'copyright'
  end

  def self.down
    remove_column :maps, :license
  end
end
