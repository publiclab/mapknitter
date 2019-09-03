class SetDefaultForBandStrings < ActiveRecord::Migration[5.2]
  def up
    change_column_default(:exports, :bands_string, "default bands_string")
  end
end
