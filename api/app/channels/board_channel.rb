 class BoardChannel < ApplicationCable::Channel

 	def subscribed
 		stream_from "board_changes:#{current_user.id}"
 	end

 end