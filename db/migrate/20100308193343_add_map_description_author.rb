class AddMapDescriptionAuthor < ActiveRecord::Migration[5.2]
  def self.up
    add_column :maps, :description, :text
    add_column :maps, :author, :string, :default => 'anonymous'
  end

  def self.down
    remove_column :maps, :description
    remove_column :maps, :author
  end
end
