class CreateMessages < ActiveRecord::Migration
  def self.up
    create_table :messages do |t|
      t.string :author
      t.string :text
      t.string :source #twitter, web, etc... clickatell, frontlinesms...
      t.string :location_string
      t.timestamps
    end
    
    create_table :keyvalues do |t|
      t.string :key
      t.string :value
      t.timestamps
    end
  end

  def self.down
    drop_table :messages
    drop_table :keyvalues
  end
end
