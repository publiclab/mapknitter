require 'open3'

# custom validator used in map.rb
class NotAtOriginValidator < ActiveModel::Validator
  def validate(record)
    # adding exception to maps created before this validation was added: https://github.com/publiclab/mapknitter/issues/1264
    if null_island?(record) && record.created_at > DateTime.new(2015, 1, 13, 0, 0, 0)
      record.errors[:base] << '0,0 is an unlikely locale.'
    end
  end

  def null_island?(record)
    record.lat.zero? || record.lon.zero?
  end
end
