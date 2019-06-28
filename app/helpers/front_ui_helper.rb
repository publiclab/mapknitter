module FrontUiHelper
  def profile_image(author)
    author.warpables.last.image.url
  end

  def anonymous(maps)
    maps.anonymous
  end

  def featured(maps)
    maps.featured
  end
end
