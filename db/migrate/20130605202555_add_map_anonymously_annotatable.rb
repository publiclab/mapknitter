class AddMapAnonymouslyAnnotatable < ActiveRecord::Migration[5.2]
  def self.up
    add_column :maps, :anon_annotatable, :boolean, :default => false
  end

  def self.down
    remove_column :maps, :anon_annotatable
  end
end
