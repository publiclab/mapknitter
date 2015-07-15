# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20150715162314) do

  create_table "annotations", :force => true do |t|
    t.integer  "map_id"
    t.integer  "user_id"
    t.string   "annotation_type"
    t.string   "text"
    t.string   "style"
    t.string   "coordinates"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  create_table "comments", :force => true do |t|
    t.string   "user_id"
    t.string   "body"
    t.integer  "map_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "exports", :force => true do |t|
    t.integer  "map_id",       :default => 0
    t.integer  "size",         :default => 0
    t.integer  "width",        :default => 0
    t.integer  "height",       :default => 0
    t.float    "cm_per_pixel", :default => 0.0
    t.string   "status",       :default => "none"
    t.boolean  "tms",          :default => false
    t.boolean  "jpg",          :default => false
    t.boolean  "geotiff",      :default => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "zip",          :default => false,    :null => false
    t.text     "bands_string",                       :null => false
    t.string   "export_type",  :default => "normal", :null => false
    t.integer  "user_id",      :default => 0
  end

  create_table "maps", :force => true do |t|
    t.string   "name",                                             :default => ""
    t.decimal  "lat",              :precision => 20, :scale => 10, :default => 0.0
    t.decimal  "lon",              :precision => 20, :scale => 10, :default => 0.0
    t.integer  "version",                                          :default => 1
    t.string   "password",                                         :default => ""
    t.text     "styles"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "description"
    t.string   "author",                                           :default => "anonymous"
    t.decimal  "zoom",             :precision => 15, :scale => 10, :default => 2.0
    t.string   "location",                                         :default => ""
    t.string   "static_data",                                      :default => ""
    t.boolean  "vectors",                                          :default => false,       :null => false
    t.string   "tiles",                                            :default => "google",    :null => false
    t.string   "email",                                            :default => "",          :null => false
    t.boolean  "archived",                                         :default => false,       :null => false
    t.text     "tile_url"
    t.text     "tile_layer"
    t.string   "license",                                          :default => "copyright"
    t.integer  "user_id",                                          :default => 0
    t.boolean  "anon_annotatable",                                 :default => false
    t.string   "slug"
  end

  add_index "maps", ["slug"], :name => "index_maps_on_slug", :unique => true

  create_table "nodes", :force => true do |t|
    t.string   "color",                                       :default => "red"
    t.string   "author",                                      :default => "anonymous"
    t.decimal  "lat",         :precision => 20, :scale => 10, :default => 0.0
    t.decimal  "lon",         :precision => 20, :scale => 10, :default => 0.0
    t.integer  "way_id",                                      :default => 0
    t.integer  "order",                                       :default => 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",                                        :default => ""
    t.string   "description",                                 :default => ""
    t.integer  "map_id",                                      :default => 0
    t.integer  "way_order",                                   :default => 0
    t.text     "body"
  end

  create_table "tags", :force => true do |t|
    t.string   "user_id"
    t.string   "name"
    t.integer  "map_id"
    t.integer  "warpable_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tags", ["map_id"], :name => "index_tags_on_map_id"
  add_index "tags", ["user_id"], :name => "index_tags_on_user_id"
  add_index "tags", ["warpable_id"], :name => "index_tags_on_warpable_id"

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.string   "identity_url"
    t.string   "role",                      :limit => 40,  :default => "basic"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

  create_table "warpables", :force => true do |t|
    t.integer  "parent_id"
    t.string   "image_content_type"
    t.string   "image_file_name"
    t.string   "thumbnail"
    t.integer  "image_file_size"
    t.integer  "width"
    t.integer  "height"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "map_id",             :default => 0
    t.string   "nodes",              :default => ""
    t.boolean  "locked",             :default => false, :null => false
    t.boolean  "deleted",            :default => false, :null => false
    t.text     "history",                               :null => false
    t.float    "cm_per_pixel",       :default => 0.0,   :null => false
  end

  create_table "ways", :force => true do |t|
    t.string   "color",                                       :default => "red"
    t.string   "author",                                      :default => "anonymous"
    t.decimal  "lat1",        :precision => 20, :scale => 10, :default => 0.0
    t.decimal  "lat2",        :precision => 20, :scale => 10, :default => 0.0
    t.decimal  "lon1",        :precision => 20, :scale => 10, :default => 0.0
    t.decimal  "lon2",        :precision => 20, :scale => 10, :default => 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",                                        :default => ""
    t.string   "description",                                 :default => ""
    t.boolean  "complete",                                    :default => true
    t.integer  "map_id",                                      :default => 0
    t.text     "body"
  end

end
