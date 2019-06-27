module FrontUiHelper
  def profile_image(author)
    author.warpables.last.image.url
  end
end
