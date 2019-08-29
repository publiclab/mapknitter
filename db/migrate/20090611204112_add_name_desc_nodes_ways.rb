class AddNameDescNodesWays < ActiveRecord::Migration[5.2]
  def self.up
    add_column :ways, :name, :string, :default => ""
    add_column :ways, :description, :string, :default => ""
    add_column :nodes, :name, :string, :default => ""
    add_column :nodes, :description, :string, :default => ""
  end

  def self.down
    remove_column :ways, :name
    remove_column :ways, :description
    remove_column :nodes, :name
    remove_column :nodes, :description
  end
end
