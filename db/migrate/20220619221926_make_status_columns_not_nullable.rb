class MakeStatusColumnsNotNullable < ActiveRecord::Migration[5.2]
  def change
    change_column_null :users, :status, false
    change_column_null :maps, :status, false
  end
end
