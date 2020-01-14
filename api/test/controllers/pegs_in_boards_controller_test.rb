require 'test_helper'

class PegsInBoardsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @pegs_in_board = pegs_in_boards(:one)
  end

  test "should get index" do
    get pegs_in_boards_url, as: :json
    assert_response :success
  end

  test "should create pegs_in_board" do
    assert_difference('PegsInBoard.count') do
      post pegs_in_boards_url, params: { pegs_in_board: {  } }, as: :json
    end

    assert_response 201
  end

  test "should show pegs_in_board" do
    get pegs_in_board_url(@pegs_in_board), as: :json
    assert_response :success
  end

  test "should update pegs_in_board" do
    patch pegs_in_board_url(@pegs_in_board), params: { pegs_in_board: {  } }, as: :json
    assert_response 200
  end

  test "should destroy pegs_in_board" do
    assert_difference('PegsInBoard.count', -1) do
      delete pegs_in_board_url(@pegs_in_board), as: :json
    end

    assert_response 204
  end
end
