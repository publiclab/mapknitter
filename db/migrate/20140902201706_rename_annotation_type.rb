class RenameAnnotationType < ActiveRecord::Migration[5.2]
  def self.up
    rename_column :annotations, :type, :annotation_type
  end

  def self.down
    rename_column :annotations, :annotation_type, :type
  end
end
