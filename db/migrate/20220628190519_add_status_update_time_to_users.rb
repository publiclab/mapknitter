class AddStatusUpdateTimeToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :status_updated_at, :datetime, null: true
  end
end
