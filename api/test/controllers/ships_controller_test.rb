require 'test_helper'

class ShipsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @ship = ships(:one)
  end

  test "should get index" do
    get ships_url, as: :json
    assert_response :success
  end

  test "should create ship" do
    assert_difference('Ship.count') do
      post ships_url, params: { ship: {  } }, as: :json
    end

    assert_response 201
  end

  test "should show ship" do
    get ship_url(@ship), as: :json
    assert_response :success
  end

  test "should update ship" do
    patch ship_url(@ship), params: { ship: {  } }, as: :json
    assert_response 200
  end

  test "should destroy ship" do
    assert_difference('Ship.count', -1) do
      delete ship_url(@ship), as: :json
    end

    assert_response 204
  end
end
