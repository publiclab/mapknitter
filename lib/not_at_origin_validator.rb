require 'open3'

# custom validator used in map.rb
class NotAtOriginValidator < ActiveModel::Validator
  def validate(rec)
    rec.errors[:base] << '0,0 is an unlikely locale.' if null_island?(rec)
  end

  def null_island?(rec)
    rec.lat.zero? || rec.lon.zero?
  end
end
