class AddMapAnonymouslyAnnotatable < ActiveRecord::Migration
  def self.up
    add_column :maps, :anon_annotatable, :boolean, :default => false
  end

  def self.down
    remove_column :maps, :anon_annotatable
  end
end
