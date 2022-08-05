class SpamController < ApplicationController
  module ModerationGuards
    def check_and_spam(map)
      # check and spam only unspammed maps
      map.spam unless map.status == Map::Status::BANNED
    end

    def check_and_ban(resource, type) # toggle between directly banning a user or banning them via their map
      if type == 'map'
        # check and ban a map's author as long as the author is unbanned and non-anonymous
        resource.user.ban unless resource.anonymous? || resource.user.status == User::Status::BANNED
      elsif type == 'user'
        # check and ban only unbanned authors
        resource.ban if resource.status != User::Status::BANNED
      end
    end

    def check_and_publish(map)
      # check and publish only spammed or moderated maps
      map.publish unless map.status == Map::Status::NORMAL
    end

    def check_and_unban(resource, type) # toggle between directly unbanning a user or unbanning them via their map
      if type == 'map'
        # check and unban a map's author as long as the author is banned and non-anonymous
        resource.user.unban unless resource.anonymous? || resource.user.status != User::Status::BANNED
      elsif type == 'user'
        # check and unban only banned authors
        resource.unban if resource.status == User::Status::BANNED
      end
    end
  end

  include ModerationGuards

  before_action :require_login
  before_action { logged_in_as(%w[admin moderator], 'moderate maps and users') }

  def spam_map
    @map = Map.find(params[:id])
    if check_and_spam(@map)
      notice_text = 'Map marked as spam.'
      notice_text.chop! << ' and author banned.' if check_and_ban(@map, 'map')
    else
      notice_text = 'Map already marked as spam.'
    end
    flash[:notice] = notice_text
    redirect_back(fallback_location: root_path)
  end

  def batch_spam_maps
    spammed_maps = 0
    banned_authors = 0
    params[:ids].split(',').uniq.each do |id|
      map = Map.find(id)
      if check_and_spam(map)
        spammed_maps += 1
        banned_authors += 1 if check_and_ban(map, 'map')
      end
    end
    flash[:notice] = helpers.pluralize(spammed_maps, 'map') + ' spammed and ' + helpers.pluralize(banned_authors, 'author') + ' banned.'
    redirect_back(fallback_location: root_path)
  end

  def publish_map
    @map = Map.find(params[:id])
    if check_and_publish(@map)
      notice_text = 'Map published.'
      notice_text.chop! << ' and author unbanned.' if check_and_unban(@map, 'map')
    else
      notice_text = 'Map already published.'
    end
    flash[:notice] = notice_text
    redirect_back(fallback_location: root_path)
  end

  def batch_publish_maps
    published_maps = 0
    unbanned_authors = 0
    params[:ids].split(',').uniq.each do |id|
      map = Map.find(id)
      if check_and_publish(map)
        published_maps += 1
        unbanned_authors += 1 if check_and_unban(map, 'map')
      end
    end
    flash[:notice] = helpers.pluralize(published_maps, 'map') + ' published and ' + helpers.pluralize(unbanned_authors, 'author') + ' unbanned.'
    redirect_back(fallback_location: root_path)
  end

  def batch_delete_maps
    deleted_maps = 0
    params[:ids].split(',').uniq.each do |id|
      map = Map.find(id)
      map.destroy
      deleted_maps += 1
    end
    flash[:notice] = helpers.pluralize(deleted_maps, 'map') + ' deleted.'
    redirect_back(fallback_location: root_path)
  end

  def ban_user
    @user = User.find(params[:id])
    notice_text = check_and_ban(@user, 'user') ? 'Author banned.' : 'Author already banned.'
    flash[:notice] = notice_text
    redirect_back(fallback_location: root_path)
  rescue ActiveRecord::RecordNotFound
    flash[:error] = 'Failed to ban as the user is either anonymous or does not exist on MapKnitter.'
    redirect_back(fallback_location: root_path)
  end

  def batch_ban_users
    banned_authors = 0
    params[:ids].split(',').uniq.each do |id|
      author = User.find_by_id(id)
      if author && check_and_ban(author, 'user')
        banned_authors += 1
      end
    end
    flash[:notice] = helpers.pluralize(banned_authors, 'author') + ' banned.'
    redirect_back(fallback_location: root_path)
  end

  def unban_user
    @user = User.find(params[:id])
    notice_text = check_and_unban(@user, 'user') ? 'Author unbanned.' : 'Only banned authors can be unbanned.'
    flash[:notice] = notice_text
    redirect_back(fallback_location: root_path)
  rescue ActiveRecord::RecordNotFound
    flash[:error] = 'Failed to unban as the user is either anonymous or does not exist on MapKnitter.'
    redirect_back(fallback_location: root_path)
  end

  def batch_unban_users
    unbanned_authors = 0
    params[:ids].split(',').uniq.each do |id|
      author = User.find_by_id(id)
      if author && check_and_unban(author, 'user')
        unbanned_authors += 1
      end
    end
    flash[:notice] = helpers.pluralize(unbanned_authors, 'author') + ' unbanned.'
    redirect_back(fallback_location: root_path)
  end

  def filter_maps
    @maps = case params[:type]
      when 'spammed'
        paginate_results(Map.where(status: 0).order('updated_at DESC'))
      when 'published'
        paginate_results(Map.where(status: 1).order('updated_at DESC'))
      when 'created'
        paginate_results(Map.order('created_at DESC'))
      else
        paginate_results(Map.order('updated_at DESC'))
      end
  end
end
