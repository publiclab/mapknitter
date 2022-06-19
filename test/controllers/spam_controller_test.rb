require 'test_helper'

class SpamControllerTest < ActionController::TestCase
  def setup #called before every single test
    @map = maps(:saugus)
    @maps = [maps(:cubbon)]
  end

  def custom_setup
    @map_ids = @maps.collect { |map| map['id'] }.join(',')
  end

  test 'should not moderate a map if user not logged in' do
    patch(:spam_map, params: { id: @map.id })
    @map.reload

    assert_equal 'You must be logged in to access this section', flash[:warning]
    assert_redirected_to "/login?back_to=/moderate/spam_map/#{@map.id}"
    assert_equal 1, @map.status
  end

  test 'should not moderate maps if user is not an admin or a moderator' do
    custom_setup
    session[:user_id] = 1
    patch(:batch_spam_map, params: { ids: @map_ids })

    assert_equal 'Only admins and moderators can moderate maps and users.', flash[:error]
    assert_redirected_to ('/' + '?_=' + Time.now.to_i.to_s)
  end

  test 'should spam a map owned by an anonymous author and not ban the author' do
    anon_map = maps(:yaya)
    session[:user_id] = 2
    patch(:spam_map, params: { id: anon_map.id })
    anon_map.reload
    
    assert_equal 'Map marked as spam.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 0, anon_map.status
  end

  test 'should spam a map owned by a non-anonymous author and ban the author' do
    session[:user_id] = 2
    patch(:spam_map, params: { id: @map.id })
    @map.reload
  
    assert_equal 'Map marked as spam and author banned.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 0, @map.status
    assert_equal 0, @map.user.status
  end

  test 'should spam a map owned by a banned author and not ban the author again' do
    session[:user_id] = 2
    @map.spam
    @map.user.ban

    second_map = maps(:cubbon)
    patch(:spam_map, params: { id: second_map.id })
    second_map.reload
  
    assert_equal 'Map marked as spam.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 0, @map.status
    assert_equal 0, @map.user.status
    assert_equal 0, second_map.status
    assert_equal 0, second_map.user.status
  end

  test 'should not spam an already spammed map' do
    session[:user_id] = 2
    @map.spam
    @map.user.ban

    patch(:spam_map, params: { id: @map.id })
  
    assert_equal 'Map already marked as spam.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 0, @map.status
    assert_equal 0, @map.user.status
  end

  test 'should batch-spam maps and ban non-anonymous authors' do
    @maps << maps(:village)
    custom_setup
    session[:user_id] = 2
    patch(:batch_spam_map, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 2 authors banned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end

  test 'should batch-spam maps and not ban anonymous authors' do
    @maps << maps(:yaya)
    custom_setup
    session[:user_id] = 2
    patch(:batch_spam_map, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 1 author banned.', flash[:notice]
    assert_redirected_to root_path
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.one? { |map| map.user.nil? }
  end

  test 'should not batch-spam a duplicate map' do
    @maps << maps(:cubbon)
    custom_setup
    session[:user_id] = 2
    patch(:batch_spam_map, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 1
    assert_equal '1 map spammed and 1 author banned.', flash[:notice]
    assert @maps.uniq.one? { |map| map.reload.status == 0 }
    assert @maps.uniq.one? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end

  test 'should not batch-spam already-spammed maps' do
    @maps[0].spam
    @maps[0].user.ban

    assert_equal 0, @maps[0].status
    assert_equal 0, @maps[0].user.status

    custom_setup
    session[:user_id] = 2
    patch(:batch_spam_map, params: { ids: @map_ids })
    
    assert_equal @maps.length, 1
    assert_equal @maps.uniq.length, 1
    assert_equal '0 maps spammed and 0 authors banned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-spam maps and skip banning of authors already banned' do
    @maps << @map
    custom_setup
    session[:user_id] = 2
    patch(:batch_spam_map, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 1 author banned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end
end
