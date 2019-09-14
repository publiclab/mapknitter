module ModerationService
  class ModerateMap

    def process(map_id)
      @map = Map.find(map_id)
      @user = map.user

      mark_map_as_moderated if moderation_required?
    end

    private

    attr_accessor :map, :user

    def moderation_required?
      map.anonymous? || user.first_time_poster?
    end

    def mark_map_as_moderated
      map.update_attributes(status: Map::Status::MODERATED)
    end
  end
end