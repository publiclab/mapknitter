require 'test_helper'

class SpamControllerTest < ActionController::TestCase
  def setup #called before every single test
    @map = maps(:saugus)
    @maps = [maps(:cubbon)]
    @user = users(:quentin)
    @users = [users(:chris)]
  end

  def maps_custom_setup(spam_maps: true)
    if spam_maps
      @maps.uniq.collect { |map|
        map.spam
        map.user.ban
      }
    end
    @map_ids = @maps.collect(&:id).join(',')
  end

  def users_custom_setup(ban_users: true)
    if ban_users
      @users.uniq.collect { |user|
        user.ban
      }
    end
    @user_ids = @users.collect(&:id).join(',')
  end 

  test 'should not moderate a map if user not logged in' do
    patch(:spam_map, params: { id: @map.id })
    @map.reload

    assert_equal 'You must be logged in to access this section', flash[:warning]
    assert_redirected_to "/login?back_to=/moderate/spam_map/#{@map.id}"
    assert_equal 1, @map.status
  end

  test 'should not moderate maps if user is not an admin or a moderator' do
    maps_custom_setup(spam_maps: false)
    session[:user_id] = 1
    patch(:batch_spam_maps, params: { ids: @map_ids })

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
    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    patch(:batch_spam_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 2 authors banned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end

  test 'should batch-spam maps and not ban anonymous authors' do
    @maps << maps(:yaya)
    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    patch(:batch_spam_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 1 author banned.', flash[:notice]
    assert_redirected_to root_path
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.one? { |map| map.user.nil? }
  end

  test 'should not batch-spam a duplicate map' do
    @maps << maps(:cubbon)
    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    patch(:batch_spam_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 1
    assert_equal '1 map spammed and 1 author banned.', flash[:notice]
    assert @maps.uniq.one? { |map| map.reload.status == 0 }
    assert @maps.uniq.one? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end

  test 'should not batch-spam already-spammed maps' do
    maps_custom_setup
    assert_equal 0, @maps[0].status
    assert_equal 0, @maps[0].user.status

    session[:user_id] = 2
    patch(:batch_spam_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 1
    assert_equal @maps.uniq.length, 1
    assert_equal '0 maps spammed and 0 authors banned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-spam maps and skip banning of authors already banned' do
    @maps << @map
    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    patch(:batch_spam_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps spammed and 1 author banned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }
    assert_redirected_to root_path
  end

  test 'should publish a spammed map owned by a banned non-anonymous author and unban the author' do
    @map.spam
    @map.user.ban

    assert_equal 0, @map.status
    assert_equal 0, @map.user.status

    session[:user_id] = 2
    patch(:publish_map, params: { id: @map.id })
    @map.reload
  
    assert_equal 'Map published and author unbanned.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 1, @map.status
    assert_equal 1, @map.user.status
  end

  test 'should publish a spammed map owned by an unbanned non-anonymous author and skip the unbanning process' do
    @map.spam

    assert_equal 0, @map.status
    assert_equal 1, @map.user.status

    session[:user_id] = 2
    patch(:publish_map, params: { id: @map.id })
    @map.reload
  
    assert_equal 'Map published.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 1, @map.status
    assert_equal 1, @map.user.status
  end

  test 'should publish a spammed map owned by an anonymous author and skip the unbanning process' do
    anon_map = maps(:yaya)
    assert_equal 1, anon_map.status

    anon_map.spam
    assert_equal 0, anon_map.status

    session[:user_id] = 2
    patch(:publish_map, params: { id: anon_map.id })
    anon_map.reload
    
    assert_equal 'Map published.', flash[:notice]
    assert_redirected_to root_path
    assert_equal 1, anon_map.status
  end

  test 'should not publish an already published map' do
    assert_equal 1, @map.status

    session[:user_id] = 2
    patch(:publish_map, params: { id: @map.id })
  
    assert_equal 'Map already published.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-publish maps and unban non-anonymous banned authors' do
    @maps << maps(:village)
    maps_custom_setup

    assert @maps.all? { |map| map.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }

    session[:user_id] = 2
    patch(:batch_publish_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps published and 2 authors unbanned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 1 }
    assert @maps.all? { |map| map.user.status == 1 }
    assert_redirected_to root_path
  end

  test 'should batch-publish maps and skip unbanning of anonymous authors' do
    @maps << maps(:yaya)
    @maps.collect { |map| map.spam }
    @maps[0].user.ban

    assert @maps.all? { |map| map.status == 0 }

    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    patch(:batch_publish_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps published and 1 author unbanned.', flash[:notice]
    assert_redirected_to root_path
    assert @maps.all? { |map| map.reload.status == 1 }
    assert @maps.one? { |map| map.user.nil? }
  end

  test 'should batch-publish maps and skip banning of authors already unbanned' do
    @maps << @map
    maps_custom_setup

    assert @maps.all? { |map| map.status == 0 }
    assert @maps.all? { |map| map.user.status == 0 }

    session[:user_id] = 2
    patch(:batch_publish_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps published and 1 author unbanned.', flash[:notice]
    assert @maps.all? { |map| map.reload.status == 1 }
    assert @maps.all? { |map| map.user.status == 1 }
    assert_redirected_to root_path
  end

  test 'should not batch-publish a duplicate map' do
    @maps << maps(:cubbon)
    maps_custom_setup

    assert @maps.uniq.one? { |map| map.status == 0 }
    assert @maps.uniq.one? { |map| map.user.status == 0 }

    session[:user_id] = 2
    patch(:batch_publish_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 1
    assert_equal '1 map published and 1 author unbanned.', flash[:notice]
    assert @maps.uniq.one? { |map| map.reload.status == 1 }
    assert @maps.uniq.one? { |map| map.user.status == 1 }
    assert_redirected_to root_path
  end

  test 'should not batch-publish already-published maps' do
    maps_custom_setup(spam_maps: false)
    assert_equal 1, @maps[0].status
    assert_equal 1, @maps[0].user.status

    session[:user_id] = 2
    patch(:batch_publish_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 1
    assert_equal @maps.uniq.length, 1
    assert_equal '0 maps published and 0 authors unbanned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-delete maps' do
    @maps << maps(:yaya)
    all_maps_count = Map.count

    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    delete(:batch_delete_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 2
    assert_equal '2 maps deleted.', flash[:notice]
    assert_redirected_to root_path
    assert_equal Map.count, all_maps_count - 2
  end

  test 'should not batch-delete a duplicate map' do
    @maps << maps(:cubbon)
    all_maps_count = Map.count

    maps_custom_setup(spam_maps: false)
    session[:user_id] = 2
    delete(:batch_delete_maps, params: { ids: @map_ids })
    
    assert_equal @maps.length, 2
    assert_equal @maps.uniq.length, 1
    assert_equal '1 map deleted.', flash[:notice]
    assert_redirected_to root_path
    assert_equal Map.count, all_maps_count - 1
  end

  test 'should ban an unbanned user' do
    session[:user_id] = 2
    assert_equal @user.status, User::Status::NORMAL

    patch(:ban_user, params: { id: @user.id })
    @user.reload

    assert_equal 'Author banned.', flash[:notice]
    assert_equal User::Status::BANNED, @user.status
    assert_redirected_to root_path
  end

  test 'should not ban an anonymous author' do
    session[:user_id] = 2
    patch(:ban_user, params: { id: 0 })
    
    assert_equal 'Failed to ban as the user is either anonymous or does not exist on MapKnitter.', flash[:error]
    assert_redirected_to root_path
  end

  test 'should not ban an already banned user' do
    @map.user.ban
    assert_equal @map.user.id, @user.id

    @user.reload
    assert_equal User::Status::BANNED, @user.status

    session[:user_id] = 2
    patch(:ban_user, params: { id: @user.id })

    assert_equal 'Author already banned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-ban users' do
    @users << @user
    users_custom_setup(ban_users: false)

    session[:user_id] = 2
    patch(:batch_ban_users, params: { ids: @user_ids })
    
    assert_equal 2, @users.length
    assert_equal 2, @users.uniq.length
    assert_equal '2 authors banned.', flash[:notice]
    assert @users.all? { |user| user.reload.status == User::Status::BANNED }
    assert_redirected_to root_path
  end

  test 'should not batch-ban a duplicate user' do
    @users << users(:chris)
    users_custom_setup(ban_users: false)

    session[:user_id] = 2
    patch(:batch_ban_users, params: { ids: @user_ids })
    
    assert_equal 2, @users.length
    assert_equal 1, @users.uniq.length
    assert_equal '1 author banned.', flash[:notice]
    assert @users.uniq.one? { |user| user.reload.status == User::Status::BANNED }
    assert_redirected_to root_path
  end

  test 'should not batch-ban already-banned users' do
    users_custom_setup

    assert @users.uniq.one? { |user| user.status == User::Status::BANNED }

    session[:user_id] = 2
    patch(:batch_ban_users, params: { ids: @user_ids })
    
    assert_equal 1, @maps.length
    assert_equal 1, @maps.uniq.length
    assert_equal '0 authors banned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should unban a banned user' do
    @user.ban
    assert_equal User::Status::BANNED, @user.status

    session[:user_id] = 2
    patch(:unban_user, params: { id: @user.id })
    @user.reload

    assert_equal 'Author unbanned.', flash[:notice]
    assert_equal User::Status::NORMAL, @user.status
    assert_redirected_to root_path
  end

  test 'should not unban a non-existent author' do
    session[:user_id] = 2
    patch(:unban_user, params: { id: 22 })
    
    assert_equal 'Failed to unban as the user is either anonymous or does not exist on MapKnitter.', flash[:error]
    assert_redirected_to root_path
  end

  test "should not unban a user that hasn't been banned in the first place" do
    assert_equal User::Status::NORMAL, @user.status

    session[:user_id] = 2
    patch(:unban_user, params: { id: @user.id })

    assert_equal 'Only banned authors can be unbanned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should batch-unban users' do
    @users << @user
    users_custom_setup

    session[:user_id] = 2
    patch(:batch_unban_users, params: { ids: @user_ids })
    
    assert_equal 2, @users.length
    assert_equal 2, @users.uniq.length
    assert_equal '2 authors unbanned.', flash[:notice]
    assert @users.all? { |user| user.reload.status == User::Status::NORMAL }
    assert_redirected_to root_path
  end

  test 'should not batch-unban a duplicate user' do
    @users << users(:chris)
    users_custom_setup

    session[:user_id] = 2
    patch(:batch_unban_users, params: { ids: @user_ids })
    
    assert_equal 2, @users.length
    assert_equal 1, @users.uniq.length
    assert_equal '1 author unbanned.', flash[:notice]
    assert @users.uniq.one? { |user| user.reload.status == User::Status::NORMAL }
    assert_redirected_to root_path
  end

  test 'should not batch-unban unbanned users' do
    users_custom_setup(ban_users: false)

    assert @users.uniq.one? { |user| user.status == User::Status::NORMAL }

    session[:user_id] = 2
    patch(:batch_unban_users, params: { ids: @user_ids })
    
    assert_equal 1, @maps.length
    assert_equal 1, @maps.uniq.length
    assert_equal '0 authors unbanned.', flash[:notice]
    assert_redirected_to root_path
  end

  test 'should filter maps and show only published maps' do
    @map.spam

    assert_equal Map::Status::BANNED, @map.status
    assert_equal 'Saugus Landfill Incinerator', @map.name

    session[:user_id] = 2
    post(:filter_maps, params: { type: 'published' })
    @maps = assigns(:maps)
    
    assert_equal 5, Map.count
    assert_equal 4, @maps.length
    assert @maps.all? { |map| map.status == Map::Status::NORMAL }
    assert @maps.collect(&:name).exclude?('Saugus Landfill Incinerator')
  end

  test 'should filter maps and show only spammed maps' do
    @map.spam

    session[:user_id] = 2
    post(:filter_maps, params: { type: 'spammed' })
    @maps = assigns(:maps)
    
    assert_equal 5, Map.count
    assert_equal 1, @maps.length
    assert @maps.all? { |map| map.status == Map::Status::BANNED && map.name == 'Saugus Landfill Incinerator'}
  end

  test 'should show first 3 recently created maps' do
    session[:user_id] = 2
    post(:filter_maps, params: { type: 'created', limit: 3 })
    @maps = assigns(:maps)
    
    assert_equal 5, Map.count
    assert_equal 3, @maps.length
  end

  test 'should show the most recently updated map' do
    session[:user_id] = 2
    post(:filter_maps, params: { type: 'updated', limit: 1 })
    @maps = assigns(:maps)
    
    assert_equal 5, Map.count
    assert_equal 1, @maps.length
  end
end
