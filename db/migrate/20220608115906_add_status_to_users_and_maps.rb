class AddStatusToUsersAndMaps < ActiveRecord::Migration[5.2]
  class Map < ApplicationRecord
  end

  def up
    add_column :users, :status, :integer, :default => 1
    add_column :maps, :status, :integer, :default => 1

    Map.reset_column_information
    Map.where(archived: true).update(status: 0)
  end

  def down
    remove_column :users, :status
    remove_column :maps, :status
  end
end
