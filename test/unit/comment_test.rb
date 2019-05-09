require 'test_helper'
class CommentTest < ActiveSupport::TestCase

  def setup
    @map = maps(:saugus)
  end

  test 'should comment' do
    comment = @map.comments.new(
      user_id: 1,
      body: 'hello there!'
    )
    assert comment.save
    comment = @map.comments.last
    assert_equal 'hello there!', comment.body
    assert_equal User.find(1).login, comment.author
  end

  test 'should not save blank comment' do
    comment = @map.comments.new(user_id: 1)
    assert !comment.save, 'Saved comment without body'
  end

  test 'should not save comment without user_id' do
    comment = @map.comments.new(
      body: 'This is a nice thing to say.'
    )
    assert !comment.save, 'Saved comment without user_id'
  end

  test 'should return an author' do
    comment = comments(:one)
    assert_equal 'quentin', comment.author
  end

  test 'should not save comment without map' do
    user = users(:quentin)
    comment = user.comments.new(body: 'Map knitting')
    assert !comment.save, 'Saved comment without map'
  end
end
