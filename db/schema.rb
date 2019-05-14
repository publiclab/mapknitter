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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20190420025012) do

  create_table "annotations", force: :cascade do |t|
    t.integer  "map_id",          limit: 4
    t.integer  "user_id",         limit: 4
    t.string   "annotation_type", limit: 255
    t.string   "text",            limit: 255
    t.string   "style",           limit: 255
    t.string   "coordinates",     limit: 255
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "comments", force: :cascade do |t|
    t.string   "user_id",    limit: 255
    t.string   "body",       limit: 255
    t.integer  "map_id",     limit: 4
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "exports", force: :cascade do |t|
    t.integer  "map_id",       limit: 4,     default: 0
    t.integer  "size",         limit: 4,     default: 0
    t.integer  "width",        limit: 4,     default: 0
    t.integer  "height",       limit: 4,     default: 0
    t.float    "cm_per_pixel", limit: 24,    default: 0.0
    t.string   "status",       limit: 255,   default: "none"
    t.boolean  "tms",                        default: false
    t.boolean  "jpg",                        default: false
    t.boolean  "geotiff",                    default: false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.boolean  "zip",                        default: false,    null: false
    t.text     "bands_string", limit: 65535,                    null: false
    t.string   "export_type",  limit: 255,   default: "normal", null: false
    t.integer  "user_id",      limit: 4,     default: 0
    t.string   "export_url",   limit: 255
  end

  create_table "maps", force: :cascade do |t|
    t.string   "name",             limit: 255,                             default: ""
    t.decimal  "lat",                            precision: 20, scale: 10, default: 0.0
    t.decimal  "lon",                            precision: 20, scale: 10, default: 0.0
    t.integer  "version",          limit: 4,                               default: 1
    t.string   "password",         limit: 255,                             default: ""
    t.text     "styles",           limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "description",      limit: 65535
    t.string   "author",           limit: 255,                             default: "anonymous"
    t.decimal  "zoom",                           precision: 15, scale: 10, default: 2.0
    t.string   "location",         limit: 255,                             default: ""
    t.string   "static_data",      limit: 255,                             default: ""
    t.boolean  "vectors",                                                  default: false,       null: false
    t.string   "tiles",            limit: 255,                             default: "google",    null: false
    t.string   "email",            limit: 255,                             default: "",          null: false
    t.boolean  "archived",                                                 default: false,       null: false
    t.text     "tile_url",         limit: 65535
    t.text     "tile_layer",       limit: 65535
    t.string   "license",          limit: 255,                             default: "copyright"
    t.integer  "user_id",          limit: 4,                               default: 0
    t.boolean  "anon_annotatable",                                         default: false
    t.string   "slug",             limit: 255
  end

  add_index "maps", ["slug"], name: "index_maps_on_slug", unique: true, using: :btree

  create_table "nodes", force: :cascade do |t|
    t.string   "color",       limit: 255,                             default: "red"
    t.string   "author",      limit: 255,                             default: "anonymous"
    t.decimal  "lat",                       precision: 20, scale: 10, default: 0.0
    t.decimal  "lon",                       precision: 20, scale: 10, default: 0.0
    t.integer  "way_id",      limit: 4,                               default: 0
    t.integer  "order",       limit: 4,                               default: 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",        limit: 255,                             default: ""
    t.string   "description", limit: 255,                             default: ""
    t.integer  "map_id",      limit: 4,                               default: 0
    t.integer  "way_order",   limit: 4,                               default: 0
    t.text     "body",        limit: 65535
  end

  create_table "tags", force: :cascade do |t|
    t.string   "user_id",     limit: 255
    t.string   "name",        limit: 255
    t.integer  "map_id",      limit: 4
    t.integer  "warpable_id", limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tags", ["map_id"], name: "index_tags_on_map_id", using: :btree
  add_index "tags", ["user_id"], name: "index_tags_on_user_id", using: :btree
  add_index "tags", ["warpable_id"], name: "index_tags_on_warpable_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "login",                     limit: 40
    t.string   "name",                      limit: 100, default: ""
    t.string   "email",                     limit: 100
    t.string   "crypted_password",          limit: 40
    t.string   "salt",                      limit: 40
    t.string   "identity_url",              limit: 255
    t.string   "role",                      limit: 40,  default: "basic"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            limit: 40
    t.datetime "remember_token_expires_at"
  end

  add_index "users", ["login"], name: "index_users_on_login", unique: true, using: :btree

  create_table "warpables", force: :cascade do |t|
    t.integer  "parent_id",          limit: 4
    t.string   "image_content_type", limit: 255
    t.string   "image_file_name",    limit: 255
    t.string   "thumbnail",          limit: 255
    t.integer  "image_file_size",    limit: 4
    t.integer  "width",              limit: 4
    t.integer  "height",             limit: 4
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "map_id",             limit: 4,     default: 0
    t.string   "nodes",              limit: 255,   default: ""
    t.boolean  "locked",                           default: false, null: false
    t.boolean  "deleted",                          default: false, null: false
    t.text     "history",            limit: 65535,                 null: false
    t.float    "cm_per_pixel",       limit: 24,    default: 0.0,   null: false
  end

  create_table "ways", force: :cascade do |t|
    t.string   "color",       limit: 255,                             default: "red"
    t.string   "author",      limit: 255,                             default: "anonymous"
    t.decimal  "lat1",                      precision: 20, scale: 10, default: 0.0
    t.decimal  "lat2",                      precision: 20, scale: 10, default: 0.0
    t.decimal  "lon1",                      precision: 20, scale: 10, default: 0.0
    t.decimal  "lon2",                      precision: 20, scale: 10, default: 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "name",        limit: 255,                             default: ""
    t.string   "description", limit: 255,                             default: ""
    t.boolean  "complete",                                            default: true
    t.integer  "map_id",      limit: 4,                               default: 0
    t.text     "body",        limit: 65535
  end

end
