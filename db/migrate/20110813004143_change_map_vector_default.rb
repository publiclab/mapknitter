class ChangeMapVectorDefault < ActiveRecord::Migration[5.2]
  def self.up
    change_column_default(:maps, :vectors, false)
  end

  def self.down
  end
end
