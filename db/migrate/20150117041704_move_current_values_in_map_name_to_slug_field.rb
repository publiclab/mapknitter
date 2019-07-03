class MoveCurrentValuesInMapNameToSlugField < ActiveRecord::Migration[5.2]
  def up
  	execute "UPDATE maps m SET m.slug = m.name"
  end

  def down
  	execute "UPDATE maps m SET m.slug = ''"
  end
end
