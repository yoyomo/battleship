require 'test_helper'

class PegsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @peg = pegs(:one)
  end

  test "should get index" do
    get pegs_url, as: :json
    assert_response :success
  end

  test "should create peg" do
    assert_difference('Peg.count') do
      post pegs_url, params: { peg: {  } }, as: :json
    end

    assert_response 201
  end

  test "should show peg" do
    get peg_url(@peg), as: :json
    assert_response :success
  end

  test "should update peg" do
    patch peg_url(@peg), params: { peg: {  } }, as: :json
    assert_response 200
  end

  test "should destroy peg" do
    assert_difference('Peg.count', -1) do
      delete peg_url(@peg), as: :json
    end

    assert_response 204
  end
end
