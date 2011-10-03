class Export < ActiveRecord::Base

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

	def self.exporting
		Export.count :all, :conditions => ['status != "failed" AND status != "complete" AND status != "none" AND updated_at > ?', (DateTime.now-24.hours).to_s(:db)]
	end

end
