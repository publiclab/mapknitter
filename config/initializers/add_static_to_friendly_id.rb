module FriendlyId
  module Static
    def should_generate_new_friendly_id?
      new_record?
    end
  end
end
