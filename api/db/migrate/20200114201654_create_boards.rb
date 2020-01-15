class CreateBoards < ActiveRecord::Migration[6.0]
	def change
		create_table :boards do |t|
			
			t.references :player_one, index: true, foreign_key: {to_table: :users}
			t.references :player_two, index: true, foreign_key: {to_table: :users}
			t.references :last_player, index: true, foreign_key: {to_table: :users}

			t.jsonb :grid

			t.timestamps
		end
	end
end
