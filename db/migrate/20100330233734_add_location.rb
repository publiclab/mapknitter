class AddLocation < ActiveRecord::Migration[5.2]
  def self.up
    add_column :maps, :location, :string, :default => ''
  end

  def self.down
    remove_column :maps, :location
  end
end
