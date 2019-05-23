require 'open3'

class NotAtOriginValidator < ActiveModel::Validator
  def validate(record)
    if record.lat.zero? || record.lon.zero?
      record.errors[:base] << "Your location at 0,0 is unlikely."
    end
  end
end

class Map < ActiveRecord::Base
  extend FriendlyId
  friendly_id :name, use: %i(slugged static)

  attr_accessible :author, :name, :slug, :lat, :lon, :location, :description, :zoom, :license
  attr_accessor :image_urls

  validates_presence_of :name, :slug, :author, :lat, :lon
  validates_uniqueness_of :slug
  validates_presence_of :location, message: ' cannot be found. Try entering a latitude and longitude if this problem persists.'
  validates_format_of   :slug,
                        with: /^[\w-]*$/,
                        message: " must not include spaces and must be alphanumeric, as it'll be used in the URL of your map, like: https://mapknitter.org/maps/your-map-name. You may use dashes and underscores.",
                        on: :create
  #  validates_format_of :tile_url, :with => /^(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ix
  validates_with NotAtOriginValidator

  has_many :exports, dependent: :destroy
  has_many :tags, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :annotations, dependent: :destroy
  belongs_to :user

  has_many :warpables do
    def public_filenames
      filenames = {}
      each do |warpable|
        filenames[warpable.id] = {}
        sizes = Array.new(Warpable::THUMBNAILS.keys).push(nil)
        sizes.each do |size|
          key = !size.nil? ? size : "original"
          filenames[warpable.id][key] = warpable.public_filename(size)
        end
      end
      filenames
    end
  end

  def validate
    name != 'untitled'
    lat >= -90 && lat <= 90 && lon >= -180 && lat <= 180
  end

  # Hash the password before saving the record
  def before_create
    self.password = Password.update(password) if password != ""
  end

  def placed_warpables
    warpables.where('width > 0 AND nodes <> ""')
  end

  def private
    password != ""
  end

  def anonymous?
    author == "" || user_id.zero?
  end

  def self.bbox(minlat, minlon, maxlat, maxlon)
    Map.where(['lat > ? AND lat < ? AND lon > ? AND lon < ?', minlat, maxlat, minlon, maxlon])
  end

  def exporting?
    export&.running?
  end

  def export
    latest_export
  end

  def latest_export
    exports.last
  end

  def self.authors(limit = 50)
    Map.limit(limit)
       .order("maps.id DESC")
       .where('password = "" AND archived = "false"')
       .collect(&:author)
    #       .group("maps.author")
  end

  def self.new_maps
    find(:all, order: "created_at DESC", limit: 12, conditions: ['password = "" AND archived = "false"'])
  end

  def nodes
    nodes = {}
    warpables.each do |warpable|
      if warpable.nodes != ''
        w_nodes = []
        warpable.nodes.split(',').each do |node|
          node_obj = Node.find(node)
          w_nodes << [node_obj.lon, node_obj.lat]
        end
        nodes[warpable.id.to_s] = w_nodes
      end
      nodes[warpable.id.to_s] ||= 'none'
    end
    nodes
  end

  # find all other maps within <dist> degrees lat or lon
  def nearby_maps(dist)
    if lat.to_f == 0.0 || lon.to_f == 0.0
      []
    else
      Map.find(:all, conditions: ['id != ? AND lat > ? AND lat < ? AND lon > ? AND lon < ?', id, lat - dist, lat + dist, lon - dist, lon + dist], limit: 10)
    end
  end

  def average_scale
    # determine optimal zoom level
    puts '> calculating scale'
    pxperms = []
    placed_warpables.each do |warpable|
      pxperms << 100.00 / warpable.cm_per_pixel if warpable.placed?
    end
    average = (pxperms.inject { |sum, n| sum + n }) / pxperms.length
    average
  end

  def best_cm_per_pixel
    hist = images_histogram
    scores = []
    (0..(hist.length - 1)).each do |i|
      scores[i] = 0
      scores[i] += hist[i - 3] if i > 3
      scores[i] += hist[i - 2] if i > 2
      scores[i] += hist[i - 1] if i > 1
      scores[i] += hist[i]
      scores[i] += hist[i + 1] if i < hist.length - 2
      scores[i] += hist[i + 2] if i < hist.length - 3
      scores[i] += hist[i + 3] if i < hist.length - 4
    end
    highest = 0
    scores.each_with_index do |s, i|
      highest = i if s > scores[highest]
    end
    highest
  end

  def average_cm_per_pixel
    if !warpables.empty?
      scales = []
      count = 0
      average = 0
      placed_warpables.each do |warpable|
        count += 1
        res = warpable.cm_per_pixel
        res = 1 if res.zero? # let's not ever try to go for infinite resolution
        scales << res unless res.nil?
      end
      total_sum = (scales.inject { |sum, n| sum + n }) if scales
      average = total_sum / count if total_sum
      average
    else
      0
    end
  end

  # for sparklines graph display
  def images_histogram
    hist = []
    warpables.each do |warpable|
      res = warpable.cm_per_pixel.to_i
      hist[res] = 0 if hist[res].nil?
      hist[res] += 1
    end
    (0..hist.length - 1).each do |bin|
      hist[bin] = 0 if hist[bin].nil?
    end
    hist
  end

  # for sparklines graph display
  def grouped_images_histogram(binsize)
    hist = []
    warpables.each do |warpable|
      res = warpable.cm_per_pixel
      next if res.nil?

      res = (warpable.cm_per_pixel / (0.001 + binsize)).to_i
      hist[res] = 0 if hist[res].nil?
      hist[res] += 1
    end
    (0..hist.length - 1).each do |bin|
      hist[bin] = 0 if hist[bin].nil?
    end
    hist
  end

  # we'll eventually replace this with a JavaScript call to initiate an external export process:
  def run_export(user, resolution)
    key = APP_CONFIG ? APP_CONFIG["google_maps_api_key"] : "AIzaSyAOLUQngEmJv0_zcG1xkGq-CXIPpLQY8iQ"
    unless export
      new_export = Export.new(
        map_id: id
      )
    end
    Exporter.run_export(user,
                        resolution,
                        export || new_export,
                        id,
                        slug,
                        Rails.root.to_s,
                        average_scale,
                        placed_warpables,
                        key)
  end

  def after_create
    puts 'saving Map'
    if last = Map.find_by_name(slug, order: "version DESC")
      self.version = last.version + 1
    end
  end

  def license_link
    if license == "cc-by"
      "<a href='http://creativecommons.org/licenses/by/3.0/'>Creative Commons Attribution 3.0 Unported License</a>"
    elsif license == "publicdomain"
      "<a href='http://creativecommons.org/publicdomain/zero/1.0/'>Public Domain</a>"
    end
  end

  def has_tag(tagname)
    !Tag.find(:all, conditions: { map_id: id, name: tagname }).empty?
  end

  def add_tag(tagname, user)
    tagname = tagname.downcase
    unless has_tag(tagname)
      tags.create(
        name: tagname,
        user_id: user.id,
        map_id: id
      )
    end
  end

  def self.map
    Map.where(archived: false, password: '')
       .select('author, maps.name, lat, lon, slug, archived, password,
               users.login as user_login')
       .joins(:warpables, :user)
       .group('maps.id')
  end
end
