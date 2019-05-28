require 'open3'

# custom validator used in map.rb
class NotAtOriginValidator < ActiveModel::Validator
  def validate(record)
    record.errors[:base] << '0,0 is an unlikely locale.' if self.zeros?(record) 
  end

  def zeros?(record)
    record.lat.zero? || record.lon.zero?
  end
end
