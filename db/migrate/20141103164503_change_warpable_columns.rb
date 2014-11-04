class ChangeWarpableColumns < ActiveRecord::Migration
  def up
    rename_column(:warpables, :photo_file_name, :filename)
    rename_column(:warpables, :photo_content_type, :content_type)
    rename_column(:warpables, :photo_file_size, :size)
  end

  def down
    rename_column(:warpables, :filename, :photo_file_name)
    rename_column(:warpables, :content_type, :photo_content_type)
    rename_column(:warpables, :size, :photo_file_size)
  end
end
