class AddRemoteUrlToExports < ActiveRecord::Migration
  def change
    add_column :exports, :export_url, :string
  end
end
