require 'open3'

class NotAtOriginValidator < ActiveModel::Validator
  def validate(record)
    if record.lat == 0 || record.lon == 0
      record.errors[:base] << "Your location at 0,0 is unlikely."
    end
  end
end