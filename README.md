## MapKnitter 2

Use Public Lab's open source MapKnitter to upload your own aerial photographs (for example those from balloon or kite mapping: http://publiclab.org/balloon-mapping) and combine them into:

* web "slippy maps" like Google Maps
* GeoTiff
* TMS
* high resolution JPEG

![demo](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

## Architecture

MapKnitter is broken into three major components:

1. Map user interface
2. Application
3. Exporting system

**Component 1** has been broken out into a new Leaflet plugin, called Leaflet.DistortableImage (https://github.com/publiclab/Leaflet.DistortableImage/) and allows for client-side, CSS3-based distortion of images over a Leaflet base map

**Component 2** is a Ruby on Rails application which is the core of what you've looked at. It stores images, image corner locations, annotations, map details, and user accounts. 

**Component 3** is a set of calls to GDAL (Geospatial Data Abstraction Library) and ImageMagick which perform the distortions, geolocations, and produce export products like GeoTiff, TMS, jpg, etc. These are baked into the Warpable and Map models, as well as the Export controller, and could use some consolidation. 

Another moving part is the new-ish Annotations 2.0 which uses Leaflet.Illustrate (https://github.com/manleyjster/Leaflet.Illustrate) to provide rich annotation on top of maps. 

## License

Map Knitter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Map Knitter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Map Knitter.  If not, see <http://www.gnu.org/licenses/>.

## Installation video

For a run-through of the Prerequisites and Installation steps listed below, you can watch the install video at:

http://youtu.be/iGYGpS8rZMY

## Prerequisites

Recommended; for an Ubuntu/Debian system. Varies slightly for mac/fedora/etc

Install a database, if necessary. sqlite does not seem to work due to some table constraints.

`sudo apt-get install mysql-server`

Application-specific dependencies:

`sudo apt-get install bundler libmysqlclient-dev imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev`

(optional) For exporting, you'll need GDAL >=1.7.x (gdal.org), as well as `curl` and `zip`-- but these are not needed for much of development, unless you're working on the exporting features. 

`sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip`

Install rvm for Ruby management (http://rvm.io)

`curl -L https://get.rvm.io | bash -s stable`

**Note:** At this point during the process, you may want to log out and log back in, or open a new terminal window; RVM will then properly load in your environment. 

**Ubuntu users:** You may need to enable `Run command as a login shell` in Ubuntu's Terminal, under Profile Preferences > Title and Command. Then close the terminal and reopen it.

Then, use RVM to install version 2.1.2 of Ruby:

`rvm install 2.1.2`

You'll also need **bower** which is available through NPM. To install NPM, you can run:

`sudo apt-get install npm`

However, on Ubuntu, you may need to also install the `nodejs-legacy` package, as due to a naming collision, some versions of Ubuntu already have an unrelated package called `node`. To do this, run:

`sudo apt-get install nodejs-legacy`

Once NPM is installed, you should be able to run:

`sudo npm install -g bower`

## Installation

You'll need at least Ruby v1.9.3 (**v2.1.x** preferred)

1. Download a copy of the source with `git clone https://github.com/publiclab/mapknitter.git` 
2. Install gems with `bundle install` from the rails root folder. You may need to run `bundle update` if you have older gems in your environment.
3. Copy and configure config/database.yml from config/database.yml.example, using a new empty database you've created
4. Copy and configure config/config.yml from config/config.yml.example (for now, this is only for the [Google Maps API Key, which is optional](http://stackoverflow.com/questions/2769148/whats-the-api-key-for-in-google-maps-api-v3))
5. Initialize database with `bundle exec rake db:setup`
6. Enter ReCaptcha public and private keys in config/initializers/recaptcha.rb, copied from recaptcha.rb.example. To get keys, visit https://google.com/recaptcha/admin
7. Install static assets (like external javascript libraries, fonts) with `bower install` 
8. Start rails with `bundle exec passenger start` from the Rails root and open http://localhost:3000 in a web browser. (For some, just `passenger start` will work; adding `bundle exec` ensures you're using the version of passenger you just installed with Bundler.)

## Bugs and support

To report bugs and request features, please use the GitHub issue tracker provided at https://github.com/publiclab/mapknitter/issues 

For additional support, join the Public Lab website and mailing list at http://publiclab.org/lists or for urgent requests, email web@publiclab.org

For questions related to the use of this software and balloon or kite mapping, the same page links to the "grassrootsmapping" discussion group. 

## Developers

Help improve Public Lab software!

* Join the 'plots-dev@googlegroups.com' discussion list to get involved
* Look for open issues at https://github.com/publiclab/mapknitter/issues
* Review contributor guidelines at http://publiclab.org/wiki/contributing-to-public-lab-software
* Some devs hang out in http://publiclab.org/chat (irc webchat)

