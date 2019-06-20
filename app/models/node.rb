class Node < ApplicationRecord
  belongs_to :way, optional: true
end
