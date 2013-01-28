class AddNodeAndWayBody < ActiveRecord::Migration
  def self.up
    add_column :nodes, :body, :text
    add_column :ways, :body, :text

    Nodes.find(:all, :conditions => ["description != ''"]).each do |node|
      node.body = node.description
      node.save
    end
    Ways.find(:all, :conditions => ["description != ''"]).each do |way|
      way.body = way.description
      way.save
    end
  end

  def self.down
    remove_column :nodes, :body
    remove_column :ways, :body
  end
end
