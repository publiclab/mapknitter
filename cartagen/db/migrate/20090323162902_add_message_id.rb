class AddMessageId < ActiveRecord::Migration
  def self.up
    add_column :keyvalues, :message_id, :integer, :default => 0
  end

  def self.down
    remove_column :keyvalues, :message_id
  end
end
