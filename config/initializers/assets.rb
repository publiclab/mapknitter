require 'uglifier'
# Be sure to restart your server when you modify this file.

Rails.application.configure do
    # Version of your assets, change this if you want to expire all your assets.
    config.assets.version = '1.3'
    config.assets.js_compressor = Uglifier.new(harmony: true)
    config.assets.css_compressor = :sass

    # Add additional assets to the asset load path.
    # Rails.application.config.assets.paths << Emoji.images_path
    # Add Yarn node_modules folder to the asset load path.
    config.assets.paths << Rails.root.join('node_modules')

    config.assets.precompile += ['tags.js',
                               'uploads.js',
                               'knitter.js',
                               'annotations.js',
                               'maps.js',
                               'leaflet-fullHash.js']

    # Precompile additional assets.
    # application.js, application.css, and all non-JS/CSS in the app/assets
    # folder are already added.
    # Rails.application.config.assets.precompile += %w( admin.js admin.css )
end
