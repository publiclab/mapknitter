class SpamManagementController < ApplicationController
  before_action :validate_user

  def spam_maps
      @maps = Map.paginate(page: params[:page], per_page: params[:pagination])
      @maps = case params[:type]
               when 'unmoderated'
                 @maps.where(status: Map::Status::MODERATED).order('changed DESC')
               when 'published'
                 @maps.where(status: Map::Status::NORMAL).order('changed DESC')
               when 'spammed'
                 @maps.where(status: Map::Status::BANNED).order('changed DESC')
               else
                 @nodes.where(status: [Map::Status::MODERATED, Map::Status::BANNED]).order('changed DESC')
              end
      render template: ''
  end

  def spam_users
      @users = User.paginate(page: params[:page], per_page: params[:pagination]).order('created_at DESC')
      @users = case params[:type]
               when 'banned'
                 @users.where(status: User::Status::BANNED)
               when 'moderator'
                 @users.where(role: 'moderator')
               when 'admin'
                 @users.where(role: 'admin')
               else
                 @users.where(status: User::Status::NORMAL)
               end
      render template: ''
  end

  private

  def validate_user
    if !require_user && !logged_in_as(%w(moderator admin))
      flash[:error] = 'Only moderators can moderate posts.'
      redirect_to '/login'
    end
  end
end