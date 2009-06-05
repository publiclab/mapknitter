# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20090605201606) do

  create_table "keyvalues", :force => true do |t|
    t.string   "key"
    t.string   "value"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "message_id", :default => 0
  end

  create_table "messages", :force => true do |t|
    t.string   "author"
    t.string   "text"
    t.string   "source"
    t.string   "location_string"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "nodes", :force => true do |t|
    t.string   "color",      :default => "red"
    t.string   "author",     :default => "anonymous"
    t.float    "lat",        :default => 0.0
    t.float    "lon",        :default => 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "way_id",     :default => 0
  end

  create_table "tweets", :force => true do |t|
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "ways", :force => true do |t|
    t.string   "color",      :default => "red"
    t.string   "author",     :default => "anonymous"
    t.integer  "lat1",       :default => 0
    t.integer  "lat2",       :default => 0
    t.integer  "lon1",       :default => 0
    t.integer  "lon2",       :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
