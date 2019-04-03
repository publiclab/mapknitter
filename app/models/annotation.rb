class Annotation < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  #attr_accessible :annotation_type, :coordinates, :text, :style

  serialize :coordinates, Array
  serialize :style, Hash

  def author
    User.find(self.user_id).login
  end

  def geometry_type
    case self.annotation_type
    when 'polyline' then
      geometry_type = 'LineString'
    when 'polygon' then
      geometry_type = 'Polygon'
    when 'rectangle' then
      geometry_type = 'Polygon'
    else
      geometry_type = 'Point'
    end

    return geometry_type
  end
end
