class AddRemoteUrlToExports < ActiveRecord::Migration[5.2]
  def change
    add_column :exports, :export_url, :string
  end
end
