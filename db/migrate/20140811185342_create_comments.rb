class CreateComments < ActiveRecord::Migration[5.2]
  def self.up
    create_table :comments do |t|
      t.string :user_id
      t.string :body
      t.integer :map_id

      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
