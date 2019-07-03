class ChangeWarpableColumns < ActiveRecord::Migration[5.2]
  def up
    rename_column(:warpables, :filename, :image_file_name)
    rename_column(:warpables, :content_type, :image_content_type)
    rename_column(:warpables, :size, :image_file_size)
  end

  def down
    rename_column(:warpables, :image_file_name, :filename)
    rename_column(:warpables, :image_content_type, :content_type)
    rename_column(:warpables, :image_file_size, :size)
  end
end
