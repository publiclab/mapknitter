class MoveCurrentValuesInMapNameToSlugField < ActiveRecord::Migration
  def up
  	execute "UPDATE maps m SET m.slug = m.name"
  end

  def down
  	execute "UPDATE maps m SET m.slug = ''"
  end
end
