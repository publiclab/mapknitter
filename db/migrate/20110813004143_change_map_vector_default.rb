class ChangeMapVectorDefault < ActiveRecord::Migration
  def self.up
    change_column_default(:maps, :vectors, false)
  end

  def self.down
  end
end
