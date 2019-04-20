# ExporterClient in lieu of a cloud-based external URL for testing purposes
class ExporterClient
  include HTTParty

  attr_reader :url

  def initialize(url)
    @url = url
  end

  def status
    response = self.class.get(url) 
    JSON.parse(response.body)
  end
end
