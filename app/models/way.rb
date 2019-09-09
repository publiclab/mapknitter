class Way < ApplicationRecord
  has_many :nodes, dependent: :destroy

  after_initialize :update_body

  def bbox=(bbox)
    # counting from left, counter-clockwise
    self.lon1, self.lat2, self.lon2, self.lat1 = bbox
  end

  protected
  def update_body
    d = self.description
    if d != ''
      self.body = d
      self.save
    end
  end
end
