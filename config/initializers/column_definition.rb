# prior to MySQL5.7, MySQL would silently convert a column that is part of a primary key and is
# DEFAULT NULL into NOT NULL with a default value of 0 (non standard behavior and not a recommended 
# practice) As of MySQL 5.7, this column is converted to NOT NULL, but without a default value, 
# throwing an error.

# the below customization both prevents that error and standardizes all of the DBs primary key data 
# with a SQL compliant syntax. All the primary keys will be sequential numbers starting from 1. 

# Plese keep in mind the compatability of this initializer with your db - if you do not want
# all of your primary keys to be sequential numbers then you can customize this function further 

# or, alternatively, 

# This can also be removed if DEFAULT NULL is removed from all columns;
# Read more at https://github.com/publiclab/mapknitter/pull/323

class ActiveRecord::ConnectionAdapters::ColumnDefinition
  def sql_type
    type.to_sym == :primary_key ? 'int(11) auto_increment PRIMARY KEY' : base.type_to_sql(type.to_sym, limit, precision, scale) rescue type
  end 
end