class CleanupKnitterAddMapArchiveAndUserEmail < ActiveRecord::Migration
  def self.up
    add_column :maps, :email, :string, :default => "", :null => false
    add_column :maps, :archived, :boolean, :default => false, :null => false
    drop_table :keyvalues
    drop_table :messages
    drop_table :tweets
  end

  def self.down
    remove_column :maps, :email
    remove_column :maps, :archived
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

    create_table :tweets do |t|
      t.timestamps
    end
  end
end
