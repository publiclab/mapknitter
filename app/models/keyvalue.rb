class Keyvalue < ActiveRecord::Base
  
  belongs_to :message
  after_create :geocode
  
  def geocode
    if self.key == 'loc' || self.key == 'l' || self.key == 'geocode'
      geo = GeoKit::GeoLoc.geocode(self.value)
      if geo.success
        Keyvalue.new(:message_id => self.message_id, :key => "lat", :value => geo.lat).save
        Keyvalue.new(:message_id => self.message_id, :key => "full_address", :value => geo.full_address).save
        Keyvalue.new(:message_id => self.message_id, :key => "state", :value => geo.state).save
        Keyvalue.new(:message_id => self.message_id, :key => "provider", :value => geo.provider).save
        Keyvalue.new(:message_id => self.message_id, :key => "city", :value => geo.city).save
        Keyvalue.new(:message_id => self.message_id, :key => "country_code", :value => geo.country_code).save
        Keyvalue.new(:message_id => self.message_id, :key => "street_address", :value => geo.street_address).save
        Keyvalue.new(:message_id => self.message_id, :key => "lng", :value => geo.lng).save
        Keyvalue.new(:message_id => self.message_id, :key => "precision", :value => geo.precision).save
        Keyvalue.new(:message_id => self.message_id, :key => "zip", :value => geo.zip).save
      end
    end
  end
  
end
