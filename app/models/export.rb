class Export < ActiveRecord::Base
  belongs_to :map
  belongs_to :user

  # currently exporting?
  def running?
    !(%w(complete none failed).include? status)
  end

  def self.average_cm_per_pixel
    e = Export.where('cm_per_pixel != "" AND cm_per_pixel < 500')
    sum = 0
    e.each do |export|
      sum += export.cm_per_pixel
    end
    if !e.empty?
      sum / e.length
    else
      0
    end
  end

  def self.histogram_cm_per_pixel
    e = Export.where('cm_per_pixel != "" AND cm_per_pixel < 500')
              .order('cm_per_pixel DESC')
    if !e.empty?
      hist = []
      (0..e.first.cm_per_pixel.to_i).each do |bin|
        hist[bin] = 0
      end
      e.each do |export|
        hist[export.cm_per_pixel.to_i] += 1
      end
      hist
    else
      []
    end
  end

  def self.histogram_cm_per_pixel_in_tens
    e = Export.where('cm_per_pixel != "" AND cm_per_pixel < 500')
      .order('cm_per_pixel desc')
    hist = []
    (0..e.first.cm_per_pixel / 10.to_i).each do |bin|
      hist[bin] = 0
    end
    e.each do |export|
      hist[export.cm_per_pixel / 10.to_i] += 1
    end
    hist
  end

  def self.export_count
    Export.where('status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?',
                 (DateTime.now - 24.hours).to_s(:db)).count
  end

  # all exports currently running
  def self.exporting
    Export.where('status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?',
      (DateTime.now - 24.hours).to_s(:db))
  end
end
