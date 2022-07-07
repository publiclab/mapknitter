class Warpable < ApplicationRecord
  attr_accessor :image
  attr_accessor :src, :srcmedium # for json generation

  require 'cartagen'

  # Paperclip; config and production/development specific configs
  # in /config/initializers/paperclip.rb
  has_attached_file :image,
    s3_protocol: 'https',
    styles: {
      medium: "500x375",
      small: "240x180",
      thumb: "100x100>",
    }

  validates_attachment_content_type :image, content_type: ["image/jpg", "image/jpeg", "image/png", "image/gif"]

  belongs_to :map, optional: true
  belongs_to :user, optional: true

  has_paper_trail on: %i(create update), only: :nodes

  # overriding JSON formatting for Leaflet.DistortableImage
  def as_json(options = {})
    json = super(options)
    json[:src] = image.url
    json[:srcmedium] = image.url(:medium)
    json[:nodes] = nodes_array
    json
  end

  # JSON formatting for file upload plugin
  def fup_json
    {
      "name" => read_attribute(:image_filename),
      "size" => read_attribute(:image_size),
      "url" => image.url(:medium),
      "original_url" => image.url(:original),
      "id" => read_attribute(:id),
      "thumbnail_url" => image.url(:thumb),
      "delete_url" => image.url,
      "delete_type" => "DELETE",
    }
  end

  def fup_error_json
    {
      "name" => read_attribute(:image_filename),
      "size" => read_attribute(:image_size),
      "error" => errors["base"],
    }
  end

  after_save :save_dimensions

  # this runs each time warpable is moved/distorted,
  # to calculate resolution
  def save_dimensions
    path = image.options[:storage] == :s3 ? image.url : image.path
    geo = Paperclip::Geometry.from_file(path.sub('https', 'http'))

    update_column(:width, geo.width)
    update_column(:height, geo.height)
  end

  # if has non-nil width and has nodes, it's been placed.
  def placed?
    !width.nil? && nodes != ''
  end

  def poly_area
    area = 0
    nodes = nodes_array
    nodes.each_with_index do |node, index|
      nextnode = if index < nodes.length - 1
        nodes[index + 1]
      else
        nodes[0]
                 end
      last = if index.positive?
        nodes[index - 1]
      else
        nodes[nodes.length - 1]
             end
      scale = 20_037_508.34
      # inefficient but workable, we don't use this that often:

      nodey = Cartagen.spherical_mercator_lat_to_y(node.lat, scale)
      nodex = Cartagen.spherical_mercator_lon_to_x(node.lon, scale)
      lasty = Cartagen.spherical_mercator_lat_to_y(last.lat, scale)
      lastx = Cartagen.spherical_mercator_lon_to_x(last.lon, scale)
      nexty = Cartagen.spherical_mercator_lat_to_y(nextnode.lat, scale)
      nextx = Cartagen.spherical_mercator_lon_to_x(nextnode.lon, scale)
      area += lastx * nodey - nodex * lasty + nodex * nexty - nextx * nodey
    end
    (area / 2).abs
  end

  # crude measure based on image width, as resolution can vary
  # across image if it's not flat on the earth
  def get_cm_per_pixel
    unless width.nil? || nodes == ''
      nodes = nodes_array
      # haversine might be more appropriate for large images
      scale = 20_037_508.34
      y1 = Cartagen.spherical_mercator_lat_to_y(nodes[0].lat, scale)
      x1 = Cartagen.spherical_mercator_lon_to_x(nodes[0].lon, scale)
      y2 = Cartagen.spherical_mercator_lat_to_y(nodes[1].lat, scale)
      x2 = Cartagen.spherical_mercator_lon_to_x(nodes[1].lon, scale)
      dist = Math.sqrt(((y2 - y1) * (y2 - y1)) + ((x2 - x1) * (x2 - x1)))
      scale = (dist * 100) / width unless width.nil? || dist.nil?
    end
    scale
  end

  def self.histogram_cm_per_pixel
    w = Warpable.where('cm_per_pixel != 0 AND cm_per_pixel < 500')
                .order('cm_per_pixel DESC')
    if !w.empty?
      hist = []
      (0..w.first.cm_per_pixel.to_i).each do |bin|
        hist[bin] = 0
      end
      w.each do |warpable|
        hist[warpable.cm_per_pixel.to_i] += 1
      end
      hist
    else
      []
    end
  end

  def nodes_array
    Node.find(nodes.split(','))
  end

  # allow uploads via URL
  # needs update for Paperclip!!
  require 'open-uri'
  attr_reader :url

  def url=(uri)
    nil if uri.blank?

    io = (
      begin
        URI.parse(uri).open
      rescue StandardError
        nil
      end
    )
    (class << io; self; end;).class_eval do
      define_method(:original_filename) { base_uri.path.split('/').last }
    end
    self.uploaded_data = io
  end

  # TODO: simplify/reduce # of parameters needed here:
  def generate_perspectival_distort(pxperm, path)
    Exporter.generate_perspectival_distort(pxperm, path, nodes_array, id, image_file_name, image, height, width)
  end

  def user_id
    Map.find(map_id)
    map.user_id
  end

  # adjust filename behavior of Paperclip after migrating from attachment_fu
  Paperclip.interpolates(:custom_filename) do |attachment, style|
    if style == :original
      basename(attachment, style) # generate hash path here
    else
      "#{basename(attachment, style)}_#{style}" # generate hash path here
    end
  end
end
