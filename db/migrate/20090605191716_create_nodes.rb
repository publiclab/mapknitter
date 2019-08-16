class CreateNodes < ActiveRecord::Migration[5.2]
  def self.up
    create_table :nodes do |t|
      t.string :color, :default => 'red'
      t.string :author, :default => 'anonymous'
      t.decimal :lat, :default => 0, :precision => 10
      t.decimal :lon, :default => 0, :precision => 10
      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end
