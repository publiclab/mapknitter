class AddRemoteUrlToExports < ActiveRecord::Migration
  def change
    add_column :exports, :remote_url, :string
  end
end
