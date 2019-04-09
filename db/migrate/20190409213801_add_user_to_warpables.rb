class AddUserToWarpables < ActiveRecord::Migration
  def change
    add_column :warpables, :user_id, :integer, references: :users
  end
end
