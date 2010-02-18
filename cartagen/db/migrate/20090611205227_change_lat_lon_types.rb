class ChangeLatLonTypes < ActiveRecord::Migration
  def self.up
  	drop_table :ways
  	drop_table :nodes
  	create_table :nodes do |t|
      t.string :color, :default => 'red'
      t.string :author, :default => 'anonymous'
      t.decimal :lat, :default => 0, :precision => 20, :scale => 10
      t.decimal :lon, :default => 0, :precision => 20, :scale => 10
      t.integer :way_id, :default => 0
      t.integer :order, :default => 0
      t.timestamps
    end
    create_table :ways do |t|
      t.string :color, :default => 'red'
      t.string :author, :default => 'anonymous'
      t.decimal :lat1, :default => 0, :precision => 20, :scale => 10
      t.decimal :lat2, :default => 0, :precision => 20, :scale => 10
      t.decimal :lon1, :default => 0, :precision => 20, :scale => 10
      t.decimal :lon2, :default => 0, :precision => 20, :scale => 10
      t.timestamps
    end
    
    add_column :ways, :name, :string, :default => ""
    add_column :ways, :description, :string, :default => ""
    add_column :nodes, :name, :string, :default => ""
    add_column :nodes, :description, :string, :default => ""
  end

  def self.down
    drop_table :ways
    drop_table :nodes
  end
end
