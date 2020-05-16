module ModerationService
  class ModerateMap
    def initialize(map_id)
      self.map = Map.find(map_id)
    end

    def process
      mark_map_as_moderated if moderation_required?
    end

    private

    attr_accessor :map

    def moderation_required?
      map.anonymous? || map.user.first_time_poster?
    end

    def mark_map_as_moderated
      map.update_attributes(status: Map::Status::MODERATED)
    end
  end
end