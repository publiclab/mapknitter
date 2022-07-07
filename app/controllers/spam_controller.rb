class SpamController < ApplicationController
  module ModerationGuards
    def check_and_spam(map)
      # check and spam only unspammed maps
      map.spam unless map.status == Map::Status::BANNED
    end

    def check_and_ban(map)
      # check and ban only unbanned non-anonymous authors
      map.user.ban unless map.anonymous? || map.user.status == User::Status::BANNED
    end

    def check_and_publish(map)
      # check and publish only spammed or moderated maps
      map.publish unless map.status == Map::Status::NORMAL
    end

    def check_and_unban(map)
      # check and unban only banned non-anonymous authors
      map.user.unban unless map.anonymous? || map.user.status != User::Status::BANNED
    end
  end

  include ModerationGuards

  before_action :require_login
  before_action { logged_in_as(%w[admin moderator], 'moderate maps and users') }

  def spam_map
    @map = Map.find(params[:id])
    if check_and_spam(@map)
      notice_text = 'Map marked as spam.'
      notice_text.chop! << ' and author banned.' if check_and_ban(@map)
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
        banned_authors += 1 if check_and_ban(map)
      end
    end
    flash[:notice] = helpers.pluralize(spammed_maps, 'map') + ' spammed and ' + helpers.pluralize(banned_authors, 'author') + ' banned.'
    redirect_back(fallback_location: root_path)
  end

  def publish_map
    @map = Map.find(params[:id])
    if check_and_publish(@map)
      notice_text = 'Map published.'
      notice_text.chop! << ' and author unbanned.' if check_and_unban(@map)
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
        unbanned_authors += 1 if check_and_unban(map)
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
end
