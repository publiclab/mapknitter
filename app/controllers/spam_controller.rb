class SpamController < ApplicationController
  module ModerationGuards
    def spam_check(map)
      #check and spam only unspammed maps
      map.spam unless map.status == Map::Status::BANNED
    end
  
    def ban_check(map)
      #check and ban only unbanned non-anonymous authors
      map.user.ban unless map.anonymous? || map.user.status == User::Status::BANNED
    end
  end

  include ModerationGuards

  require 'set'

  before_action :require_login
  before_action { logged_in_as(['admin', 'moderator'], 'moderate maps and users') }
  
  def spam_map
    @map = Map.find(params[:id])
    if spam_check(@map)
      notice_text = 'Map marked as spam.'
      notice_text.chop! << ' and author banned.' if ban_check(@map)
    else
      notice_text = 'Map already marked as spam.'
    end
    flash[:notice] = notice_text
    redirect_back(fallback_location: root_path)
  end

  def batch_spam_map
    spammed_maps = 0
    banned_authors = Set.new
    params[:ids].split(',').uniq.each do |id|
      map = Map.find(id)
      if spam_check(map)
        spammed_maps += 1
        banned_authors << map.user.id if ban_check(map)
      end
    end
    flash[:notice] = helpers.pluralize(spammed_maps, 'map') + ' spammed and ' + helpers.pluralize(banned_authors.size, 'author') + ' banned.'
    redirect_back(fallback_location: root_path)
  end
end
