class Annotation < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  serialize :coordinates, Array
  serialize :style, Hash

  def author
    User.find(self.user_id).login
  end

  def geometry_type
  	case self.annotation_type
  	when 'polyline':
  		geometry_type = 'LineString'
  	when 'polygon':
  		geometry_type = 'Polygon'
  	when 'rectangle':
  		geometry_type = 'Polygon'
  	else
  		geometry_type = 'Point'
  	end

  	return geometry_type
  end
end