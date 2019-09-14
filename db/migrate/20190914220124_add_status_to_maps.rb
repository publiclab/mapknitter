class AddStatusToMaps < ActiveRecord::Migration[5.2]
  def change
    add_column :maps, :status, :integer, :default => 1
  end
end
