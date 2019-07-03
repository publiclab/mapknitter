class CreateTweets < ActiveRecord::Migration[5.2]
  def self.up
    create_table :tweets do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :tweets
  end
end
