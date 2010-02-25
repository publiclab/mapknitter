class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :name, :default => ''
      t.decimal :lat, :default => 0, :precision => 20, :scale => 10
      t.decimal :lon, :default => 0, :precision => 20, :scale => 10
      t.decimal :zoom, :default => 0.02
      t.integer :version, :default => 1
      # haha you call this security:
      t.string :password, :default => ''
      t.text :styles, :default => ''
      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end
