class Node < ApplicationRecord
  belongs_to :way, optional: true

  after_initialize :update_body

  protected
  def update_body
    d = self.description
    if d != ''
      self.body = d
      self.save
    end
  end

end
