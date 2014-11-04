class ChangeWarpableColumns < ActiveRecord::Migration
  def up
<<<<<<< HEAD
    rename_column(:warpables, :filename, :image_file_name)
    rename_column(:warpables, :content_type, :image_content_type)
    rename_column(:warpables, :size, :image_file_size)
  end

  def down
    rename_column(:warpables, :image_file_name, :filename)
    rename_column(:warpables, :image_content_type, :content_type)
    rename_column(:warpables, :image_file_size, :size)
=======
    rename_column(:warpables, :photo_file_name, :filename)
    rename_column(:warpables, :photo_content_type, :content_type)
    rename_column(:warpables, :photo_file_size, :size)
  end

  def down
    rename_column(:warpables, :filename, :photo_file_name)
    rename_column(:warpables, :content_type, :photo_content_type)
    rename_column(:warpables, :size, :photo_file_size)
>>>>>>> much of Rails 3.2 upgrade
  end
end
