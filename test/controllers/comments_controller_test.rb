require 'test_helper'

class CommentsControllerTest < ActionController::TestCase

  # called before every single test
  def setup
    @map = maps(:saugus)
    @emails = ActionMailer::Base.deliveries
    @emails.clear
  end

  def teardown
  end

  test "should not create comment if not logged in" do
    before_count = Comment.count

    post(:create,
         params: { map_id: @map.slug,
         comment: {
           user_id: 1
         }})

    assert_response :success
    assert_equal before_count, Comment.count
  end

  test "should create comment" do
    session[:user_id] = 1
    before_count = Comment.count

    post(:create,
         params: { comment: {
         map_id: @map.id,
           body: "I'm gonna troll you!"
         }})

    assert_response :success
    assert_not_equal before_count, Comment.count
    assert_equal "I'm gonna troll you!", @map.comments.last.body
  end

  test "should update comment if commenter" do
    @comment = comments(:four)
    session[:user_id] = 4

    put(:update,
        params: { id: @comment.id,
        comment: {
          map_id: @map.id,
          body: "I'm gonna troll you!"
        }})

    # refresh the object
    @comment.reload

    assert_redirected_to "/maps/" + @map.slug
    assert_equal "I'm gonna troll you!", @comment.body
  end

  test "should not update comment if not commenter" do
    @comment = comments(:one)
    session[:user_id] = 3

    put(:update,
        params: { id: @comment.id,
        map_id: @map.slug,
        comment: {
          body: "I'm gonna troll you!"
        }})

    @comment.reload

    assert_redirected_to "/login"
    assert_not_equal "I'm gonna troll you!", @comment.body
    assert_equal "I'll just leave a comment, why don't I.", @comment.body
    assert_equal "You do not have permissions to update that comment.", flash[:error]
  end

  test "should not update comment if not logged in" do
    @comment = comments(:one)

    put(:update,
        params: { id: @comment.id,
        map_id: @map.slug,
        comment: {
          body: "I'm gonna troll you!"
        }})

    @comment.reload

    assert_redirected_to "/login"
    assert_not_equal "I'm gonna troll you!", @comment.body
    assert_equal "I'll just leave a comment, why don't I.", @comment.body
    assert_equal "You do not have permissions to update that comment.", flash[:error]
  end

  test "should delete comment" do
    @comment = comments(:one)
    session[:user_id] = 1
    before_count = Comment.count

    delete(:destroy,
           params: { id: @comment.id,
           map_id: @map.slug})

    assert_redirected_to "/maps/" + @map.slug
    assert_not_equal before_count, Comment.count
    assert_equal "Comment deleted.", flash[:notice]
  end

  test "should not delete comment if not commmenter" do
    @comment = comments(:one)
    session[:user_id] = 3
    before_count = Comment.count

    delete(:destroy,
           params: { id: @comment.id,
           map_id: @map.slug})

    assert_redirected_to "/maps/" + @map.slug
    assert_equal before_count, Comment.count
    assert_equal "You do not have permission to delete that comment.", flash[:error]
  end

  test "should not delete comment if not logged in" do
    @comment = comments(:one)
    before_count = Comment.count

    delete(:destroy,
           params: { id: @comment.id,
           map_id: @map.slug})

    assert_redirected_to "/maps/" + @map.slug
    assert_equal before_count, Comment.count
    assert_equal "You do not have permission to delete that comment.", flash[:error]
  end

  test "should not send email to author" do
    @user = users(:quentin)
    session[:user_id] = @user.id

    post(:create,
         params: { comment: {
           map_id: @map.id,
           body: "I'm gonna troll you!"
         }})

    assert_response :success
    assert_not @emails.collect(&:to).include?([@user.email])
  end

  test "should send email to author if someone else comments" do
    @user = users(:quentin)
    session[:user_id] = 3

    post(:create,
         params: { comment: {
      map_id: @map.id,
      body: "I'm gonna troll you!"
         }})

    assert_response :success
    assert @emails.collect(&:to).include?([@user.email])
    assert @emails.collect(&:subject).include?("New comment on '#{@map.name}'")
  end

  test "should send email to all commenters on commenting" do
    @joshua = users(:joshua)
    @chris = users(:chris)

    session[:user_id] = @chris.id

    post(:create,
         params: { comment: {
         map_id: @map.id,
           body: "I'm gonna troll you!"
         }})

    session[:user_id] = @joshua.id

    post(:create,
         params: { comment: {
         map_id: @map.id,
           body: "Yeah we'll see!"
         }})

    assert_response :success
    assert @emails.collect(&:to).include?([@chris.email])
    assert @emails.collect(&:subject).include?("New comment on '#{@map.name}'")
  end
end
