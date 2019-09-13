class AddDisplayWelcomeToMaps < ActiveRecord::Migration[5.2]
  def change
    add_column :maps, :display_welcome, :boolean, default: true
  end
end
