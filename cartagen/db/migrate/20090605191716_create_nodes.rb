class CreateNodes < ActiveRecord::Migration
  def self.up
    create_table :nodes do |t|
      t.string :color, :default => 'red'
      t.string :author, :default => 'anonymous'
      t.float :lat, :default => 0
      t.float :lon, :default => 0
      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end
