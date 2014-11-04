class Export < ActiveRecord::Base
  attr_accessible :map_id, :status

  validates_inclusion_of :export_type, :in => %w(normal nrg ndvi)
  belongs_to :map

  # fetches bands column from db and separates it by "," and ":" into a nested array
  # [["infrared",<map_id>],["ultraviolet",<map_id>]
  def self.bands
    b = self.bands_string.split(",")
    b.each do |band|
      b = b.split(":")
      b[1] = b[1].to_i
    end
    b
  end

  def self.average_cm_per_pixel
    e = Export.find :all, :conditions => ['cm_per_pixel != "" AND cm_per_pixel < 500'] 
    sum = 0
    e.each do |export|
      sum += export.cm_per_pixel
    end
    sum/e.length
  end

  def self.histogram_cm_per_pixel
    e = Export.find :all, :conditions => ['cm_per_pixel != "" AND cm_per_pixel < 500'], :order => "cm_per_pixel DESC"
    hist = []
    (0..e.first.cm_per_pixel.to_i).each do |bin|
      hist[bin] = 0
    end
    e.each do |export|
      hist[export.cm_per_pixel.to_i] += 1
    end
    hist
  end

  def self.histogram_cm_per_pixel_in_tens
    e = Export.find :all, :conditions => ['cm_per_pixel != "" AND cm_per_pixel < 500'], :order => "cm_per_pixel DESC"
    hist = []
    (0..(e.first.cm_per_pixel)/10.to_i).each do |bin|
      hist[bin] = 0
    end
    e.each do |export|
      hist[export.cm_per_pixel/10.to_i] += 1
    end
    hist
  end

  def self.export_count
    Export.count :all, :conditions => ['status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?', (DateTime.now-24.hours).to_s(:db)]
  end

  def self.exporting
    Export.find :all, :conditions => ['status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?', (DateTime.now-24.hours).to_s(:db)]
  end

end
