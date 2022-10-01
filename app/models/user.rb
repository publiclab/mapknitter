require 'digest/sha1'

class User < ApplicationRecord
  module Status
    VALUES = [
      BANNED = 0,    # Usage: Status::BANNED
      NORMAL = 1,    # Usage: Status::NORMAL
      MODERATED = 5, # Usage: Status::MODERATED
    ].freeze
  end

  has_many :maps
  has_many :tags
  has_many :comments
  has_many :exports
  has_many :warpables, through: :maps

  validates_presence_of     :login
  validates_length_of       :login, within: 3..40
  validates_uniqueness_of   :login
  validates_length_of       :name, maximum: 100

  validates_presence_of     :email
  validates_length_of       :email, within: 6..100 # r@a.wk
  validates_uniqueness_of   :email

  # Prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.

  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #

  def login=(value)
    write_attribute(:login, (value ? value.downcase : nil))
  end

  def email=(value)
    write_attribute(:email, (value ? value.downcase : nil))
  end

  def last_action
    maps.order('updated_at DESC').limit(1).first.updated_at
  end

  # Permissions for editing and deleting resources

  def owns?(resource)
    resource.user_id.to_i == id
  end

  def owns_map?(resource)
    resource.respond_to?(:map) && resource.map.user_id.to_i == id
  end

  def can_delete?(resource)
    owns?(resource) || owns_map?(resource) || can_moderate?
  end

  def can_edit?(resource)
    owns?(resource)
  end

  def ban
    update!({ status: Status::BANNED, status_updated_at: Time.now })
  end

  def unban
    update!({ status: Status::NORMAL, status_updated_at: Time.now })
  end

  def update_user(status)
    update!({ status: status, status_updated_at: Time.now })
  end

  # Permissions for viewing banned maps and users
  def can_moderate?
    role == 'admin' || role == 'moderator'
  end
end
