desc "Make a copy of the schema.rb"

task :copy_schema do
  file_name = "./db/schema.rb"
  copy_file_name = "./db/schema.rb.example"
  schema = File.read(file_name)
  File.write(copy_file_name, schema)
end