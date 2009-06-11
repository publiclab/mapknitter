class CreateSms < ActiveRecord::Migration
  def self.up
    # create_table "frontline_actions_triggers", :id => false, :force => true do |t|
    #   t.integer "action_id"
    #   t.integer "message_id"
    # end
    # 
    # create_table "frontline_contacts", :primary_key => "cid", :force => true do |t|
    #   t.string  "name",          :limit => 128,  :null => false
    #   t.string  "mobile_msisdn", :limit => 40,   :null => false
    #   t.string  "other_msisdn",  :limit => 40
    #   t.string  "email",         :limit => 256
    #   t.string  "notes",         :limit => 1024
    #   t.integer "active"
    #   t.integer "forms_port"
    #   t.integer "forms_wakeup"
    # end
    # 
    # add_index "frontline_contacts", ["mobile_msisdn"], :name => "mobile_msisdn", :unique => true
    # 
    # create_table "frontline_email_accounts", :primary_key => "cid", :force => true do |t|
    #   t.string  "account_name",                      :null => false
    #   t.string  "account_server"
    #   t.integer "account_server_port"
    #   t.string  "account_password",    :limit => 40
    #   t.integer "account_useSSL"
    # end
    # 
    # add_index "frontline_email_accounts", ["account_name"], :name => "account_name", :unique => true
    # 
    # create_table "frontline_emails", :force => true do |t|
    #   t.integer   "status"
    #   t.integer   "sender"
    #   t.string    "recipients", :limit => 256
    #   t.string    "subject",    :limit => 128
    #   t.string    "content",    :limit => 256
    #   t.timestamp "date",                      :null => false
    # end
    # 
    # create_table "frontline_form_field_properties", :primary_key => "fid", :force => true do |t|
    #   t.integer "field_id"
    #   t.string  "name",     :limit => 256
    #   t.string  "value",    :limit => 256
    # end
    # 
    # create_table "frontline_form_field_results", :primary_key => "fid", :force => true do |t|
    #   t.integer "field_id"
    #   t.string  "value",       :limit => 32672
    #   t.integer "response_id"
    # end
    # 
    # create_table "frontline_form_fields", :primary_key => "fid", :force => true do |t|
    #   t.integer "form_id"
    #   t.integer "form_position"
    #   t.integer "type"
    # end
    # 
    # create_table "frontline_form_responses", :primary_key => "rid", :force => true do |t|
    #   t.integer "form_id"
    #   t.string  "submitter", :limit => 256
    # end
    # 
    # create_table "frontline_forms", :primary_key => "fid", :force => true do |t|
    #   t.string  "name",     :limit => 256, :null => false
    #   t.integer "mobil_id"
    # end
    # 
    # create_table "frontline_forms_permission", :primary_key => "permission_id", :force => true do |t|
    #   t.integer "form_id"
    #   t.string  "client_msisdn", :limit => 32, :null => false
    # end
    # 
    # create_table "frontline_groups", :primary_key => "gid", :force => true do |t|
    #   t.integer "parent"
    #   t.string  "name",   :limit => 128
    # end
    # 
    # create_table "frontline_groups_members", :id => false, :force => true do |t|
    #   t.integer "group_id"
    #   t.integer "contact_id"
    # end
    # 
    # create_table "frontline_keywordActions", :force => true do |t|
    #   t.integer   "type"
    #   t.integer   "keyword_id"
    #   t.string    "command_string",                    :limit => 480
    #   t.integer   "command_integer"
    #   t.integer   "hits"
    #   t.timestamp "start_date",                                       :null => false
    #   t.timestamp "end_date",                                         :null => false
    #   t.string    "email_recipient",                   :limit => 480
    #   t.string    "email_subject",                     :limit => 480
    #   t.integer   "external_cmd_type"
    #   t.string    "external_cmd",                      :limit => 480
    #   t.integer   "external_cmd_response_type"
    #   t.integer   "external_cmd_response_action_type"
    # end
    # 
    # create_table "frontline_keyword_lists_members", :id => false, :force => true do |t|
    #   t.integer "keyword_id"
    #   t.integer "list_type"
    #   t.integer "reference_type"
    #   t.integer "reference_id"
    # end
    # 
    # create_table "frontline_keywords", :force => true do |t|
    #   t.integer "parent_id"
    #   t.string  "keyword",     :limit => 40
    #   t.string  "description", :limit => 256
    # end
    # 
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
    # 
    # create_table "frontline_phones_details", :id => false, :force => true do |t|
    #   t.string  "phone_serial",           :limit => 128, :null => false
    #   t.integer "use_sending"
    #   t.integer "use_receiving"
    #   t.integer "delete_msgs_from_phone"
    #   t.integer "use_delivery_reports"
    # end
    # 
    # create_table "frontline_schedule_tasks", :force => true do |t|
    #   t.integer   "type"
    #   t.string    "text",      :limit => 256
    #   t.integer   "sendTo"
    #   t.timestamp "startDate",                :null => false
    #   t.timestamp "endDate",                  :null => false
    #   t.integer   "frequency"
    # end
    # 
    # create_table "frontline_smsinternet", :primary_key => "isid", :force => true do |t|
    #   t.string  "serv_class",  :limit => 512
    #   t.integer "serv_serial"
    # end
    # 
    # create_table "frontline_smsinternet_props", :id => false, :force => true do |t|
    #   t.integer "isid"
    #   t.string  "prop_key",   :limit => 512
    #   t.string  "prop_value", :limit => 512
    # end
  end

  def self.down
    # drop_table :sms
  end
end
