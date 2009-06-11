class CreateWays < ActiveRecord::Migration
  def self.up
    create_table :ways do |t|
      t.string :color, :default => 'red'
      t.string :author, :default => 'anonymous'
      t.integer :lat1, :default => 0
      t.integer :lat2, :default => 0
      t.integer :lon1, :default => 0
      t.integer :lon2, :default => 0
      t.timestamps
    end
    add_column :nodes, :way_id, :integer, :default => 0
    add_column :nodes, :order, :integer, :default => 0
  end

  def self.down
    drop_table :ways
  end
end
