class AddNodeAndWayBody < ActiveRecord::Migration[5.2]
  def self.up
    add_column :nodes, :body, :text
    add_column :ways, :body, :text

    nodes = Node.all.select { |n| n.description != '' }
    nodes.each do |node|
      node.body = node.description
      node.save
    end

    ways = Way.all.select { |w| w.description != '' }
    ways.each do |way|
      way.body = way.description
      way.save
    end
  end

  def self.down
    remove_column :nodes, :body
    remove_column :ways, :body
  end
end
