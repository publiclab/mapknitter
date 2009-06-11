class Sms < ActiveRecord::Base
  establish_connection :frontline_db
  set_table_name "frontline_messages"
  set_inheritance_column :ruby_type
  set_primary_key "tid"  
  
  def save_as_message
    unless Message.find(:first,:conditions => {:author => self.omsisdnA,:source => "sms",:text => self.content,:created_at => self.dateTimeP})
      message = Message.create({
        :author => self.omsisdnA,
        :source => "sms",
        :text => self.content,
        :created_at => self.dateTimeP
      })
      message.save
    end
  end
  
end
