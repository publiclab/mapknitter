module FrontUiHelper
  def profile_image(author)
    author&.warpables&.last&.image&.url || "/images/yarn.png"
  end

  def anonymous(maps)
    maps.anonymous
  end

  def featured(maps)
    maps.featured
  end

  def location(maps, loc)
    maps.location(loc)
  end
end
