require 'test_helper'

class ShipsInBoardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ships_in_board = ships_in_boards(:one)
  end

  test "should get index" do
    get ships_in_boards_url, as: :json
    assert_response :success
  end

  test "should create ships_in_board" do
    assert_difference('ShipsInBoard.count') do
      post ships_in_boards_url, params: { ships_in_board: {  } }, as: :json
    end

    assert_response 201
  end

  test "should show ships_in_board" do
    get ships_in_board_url(@ships_in_board), as: :json
    assert_response :success
  end

  test "should update ships_in_board" do
    patch ships_in_board_url(@ships_in_board), params: { ships_in_board: {  } }, as: :json
    assert_response 200
  end

  test "should destroy ships_in_board" do
    assert_difference('ShipsInBoard.count', -1) do
      delete ships_in_board_url(@ships_in_board), as: :json
    end

    assert_response 204
  end
end
