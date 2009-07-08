class Sms < ActiveRecord::Base
  establish_connection :frontline_db
  set_table_name "frontline_messages"
  set_inheritance_column :ruby_type
  set_primary_key "tid"  
  
  validates_presence_of :type, :status, :omsisdnA, :dmsisdnA, :dest_port
  
  def before_save
    # self.type ||= ""
  end
  
  def save_as_message
    unless Message.find(:first,:conditions => {:author => self.omsisdnA,:source => "sms",:text => self.content,:created_at => self.dateTimeP})
      message = Message.create({
        :author => self.omsisdnA,
        :source => "sms",
        :text => self.content,
        :created_at => self.dateTimeP
      })
      message.save
      message
    end
  end
  
  
  
  # create_table "frontline_messages", :primary_key => "tid", :force => true do |t|
  #   t.integer   "type"
  #   t.integer   "status"
  #   t.string    "omsisdnA",          :limit => 40
  #   t.string    "dmsisdnA",          :limit => 40
  #   t.integer   "dest_port"
  #   t.string    "content",           :limit => 1024
  #   t.timestamp "dateTimeP",                         :null => false
  #   t.integer   "smscReference"
  #   t.timestamp "dispatch_dateTime",                 :null => false
  #   t.integer   "form_message"
  #   t.integer   "form_id"
  # end
  
end
