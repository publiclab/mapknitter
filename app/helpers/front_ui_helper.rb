module FrontUiHelper
  def profile_image(author)
    author.maps.last.warpables.last.image.url
  end
end
