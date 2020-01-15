class Board < ApplicationRecord

	  after_update_commit :broadcast_changes

  def broadcast_changes 
    ActionCable.server.broadcast "board_changes:#{self.player_one_id}", self
    ActionCable.server.broadcast "board_changes:#{self.player_two_id}", self
  end

end
