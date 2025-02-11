require 'rdiscount'

module MapHelper
  def markdown_to_html(markdown = "")
    RDiscount.new(markdown, :generate_toc).to_html
  end

  def convert_markdown_to_html_for_comments(markdown)
    RDiscount.new(markdown).to_html
  end
end
