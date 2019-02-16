# https://github.com/peatio/peatio/issues/590#issuecomment-352550396
require 'active_record/connection_adapters/mysql2_adapter'
class ActiveRecord::ConnectionAdapters::Mysql2Adapter
  NATIVE_DATABASE_TYPES[:primary_key] = "int(11) auto_increment PRIMARY KEY"
end
