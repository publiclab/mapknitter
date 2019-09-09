require_relative '20130128184718_add_node_and_way_body'

class EnsureNoWaysAndNodesCorruption < ActiveRecord::Migration[5.2]
  def self.up
    AddNodeAndWayBody.down
    AddNodeAndWayBody.up
  end

  def self.down
    raise ActiveRecord::IrreversibleMigration
  end
end
