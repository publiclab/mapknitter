class Annotation < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  serialize :coordinates, Array
  serialize :style, Hash

  def author
    User.find(user_id).login
  end

  def geometry_type
    geometry_type = case annotation_type
                    when 'polyline' then
                      'LineString'
                    when 'polygon' then
                      'Polygon'
                    when 'rectangle' then
                      'Polygon'
                    else
                      'Point'
                    end

    geometry_type
  end
end
