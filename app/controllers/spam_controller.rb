class SpamController < ApplicationController
  before_action :require_login
  before_action { logged_in_as(['admin', 'moderator'], 'moderate maps and users') }
  
  require 'set'
  
  def spam_map
    @map = Map.find(params[:id])
    if @map.status == Map::Status::NORMAL || @map.status == Map::Status::MODERATED
      @map.spam
      notice_text = 'Map marked as spam.'
      unless @map.anonymous? || @map.user.status == User::Status::BANNED #skip banning of anonymous or already-banned authors
        @map.user.ban
        notice_text.chop! << ' and author banned.'
      end
      flash[:notice] = notice_text
    else
      flash[:notice] = 'Map already marked as spam.'
    end
    redirect_back(fallback_location: root_path)
  end

  def batch_spam_map
    spammed_maps = 0
    banned_authors = Set.new
    params[:ids].split(',').uniq.each do |id|
      map = Map.find(id)
      if map.status == Map::Status::NORMAL || map.status == Map::Status::MODERATED
        map.spam
        spammed_maps += 1
        unless map.anonymous? || map.user.status == User::Status::BANNED #skip banning of anonymous or already-banned authors
          map.user.ban
          banned_authors << map.user.id
        end
      end
    end
    flash[:notice] = helpers.pluralize(spammed_maps, 'map') + ' spammed and ' + helpers.pluralize(banned_authors.size, 'author') + ' banned.'
    redirect_back(fallback_location: root_path)
  end
end