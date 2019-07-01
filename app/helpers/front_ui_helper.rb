module FrontUiHelper
  def profile_image(author)
    img = author.warpables&.last&.image&.url
    img ||= "/images/yarn.png"
  end

  def anonymous(maps)
    maps.anonymous
  end

  def featured(maps)
    maps.featured
  end
end
