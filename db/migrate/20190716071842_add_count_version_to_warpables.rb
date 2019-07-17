class AddCountVersionToWarpables < ActiveRecord::Migration
  def change
    add_column :warpables, :count_version, :integer
  end
end
