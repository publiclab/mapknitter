require 'digest/sha1'

class User < ActiveRecord::Base
  has_many :maps
  has_many :tags
  has_many :comments
  has_many :exports

  validates_presence_of     :login
  validates_length_of       :login, within: 3..40
  validates_uniqueness_of   :login
  validates_length_of       :name, maximum: 100

  validates_presence_of     :email
  validates_length_of       :email, within: 6..100 # r@a.wk
  validates_uniqueness_of   :email

  # HACK: HACK HACK -- how to do attr_accessible from here?
  # prevents a user from submitting a crafted form that bypasses activation
  # anything else you want your user to change should be added here.
  attr_accessible :login, :email, :name, :password, :password_confirmation

  # Authenticates a user by their login name and unencrypted password.  Returns the user or nil.
  #
  # uff.  this is really an authorization, not authentication routine.
  # We really need a Dispatch Chain here or something.
  # This will also let us return a human error message.
  #
  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?

    u = find_by_login(login.downcase) # need to get the salt
    u&.authenticated?(password) ? u : nil
  end

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
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
    owns?(resource) || owns_map?(resource) || role == "admin"
  end

  def can_edit?(resource)
    owns?(resource)
  end
end
