require 'open3'

# custom validator used in map.rb
class NotAtOriginValidator < ActiveModel::Validator
  def validate(rec)
    rec.errors[:base] << '0,0 is an unlikely locale.' if nullIsland?(rec)
  end

  def nullIsland?(rec)
    rec.lat.zero? || rec.lon.zero?
  end
end
