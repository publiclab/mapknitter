class AddMapDescriptionAuthor < ActiveRecord::Migration
  def self.up
    add_column :maps, :description, :text, :default => ''
    add_column :maps, :author, :string, :default => 'anonymous'
  end

  def self.down
    remove_column :maps, :description
    remove_column :maps, :author
  end
end
