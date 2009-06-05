class CreateNodes < ActiveRecord::Migration
  def self.up
    create_table :nodes do |t|
      t.color :string, :default => 'red'
      t.author :string, :default => 'anonymous'
      t.lat :float, :default => 0
      t.lon :float, :default => 0
      t.timestamps
    end
  end

  def self.down
    drop_table :nodes
  end
end
