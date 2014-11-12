require 'rdiscount'

module MapHelper
  def markdown_to_html(markdown = "")
    RDiscount.new(markdown, :generate_toc).to_html
  end
end
