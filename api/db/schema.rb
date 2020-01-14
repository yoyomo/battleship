# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_01_14_203107) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "boards", force: :cascade do |t|
    t.bigint "player_one_id"
    t.bigint "player_two_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["player_one_id"], name: "index_boards_on_player_one_id"
    t.index ["player_two_id"], name: "index_boards_on_player_two_id"
  end

  create_table "pegs", force: :cascade do |t|
    t.integer "type"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "pegs_in_boards", force: :cascade do |t|
    t.bigint "board_id"
    t.bigint "type_id"
    t.bigint "by_user_id"
    t.integer "position", array: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["board_id"], name: "index_pegs_in_boards_on_board_id"
    t.index ["by_user_id"], name: "index_pegs_in_boards_on_by_user_id"
    t.index ["type_id"], name: "index_pegs_in_boards_on_type_id"
  end

  create_table "ships", force: :cascade do |t|
    t.integer "class"
    t.integer "size"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "ships_in_boards", force: :cascade do |t|
    t.bigint "board_id"
    t.bigint "type_id"
    t.bigint "by_user_id"
    t.integer "position", array: true
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["board_id"], name: "index_ships_in_boards_on_board_id"
    t.index ["by_user_id"], name: "index_ships_in_boards_on_by_user_id"
    t.index ["type_id"], name: "index_ships_in_boards_on_type_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  add_foreign_key "boards", "users", column: "player_one_id"
  add_foreign_key "boards", "users", column: "player_two_id"
  add_foreign_key "pegs_in_boards", "boards"
  add_foreign_key "pegs_in_boards", "pegs", column: "type_id"
  add_foreign_key "pegs_in_boards", "users", column: "by_user_id"
  add_foreign_key "ships_in_boards", "boards"
  add_foreign_key "ships_in_boards", "ships", column: "type_id"
  add_foreign_key "ships_in_boards", "users", column: "by_user_id"
end
