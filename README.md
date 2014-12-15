MapKnitter

Use Public Lab's Map Knitter to upload your own aerial photographs (for example those from balloon or kite mapping: http://publiclab.org/wiki/balloon-mapping) and combine them into:

* web "slippy maps" like Google Maps
* GeoTiff
* TMS
* high resolution JPEG

Copyright 2010-2014 Public Lab & Jeffrey Warren

==========================
LICENSE
==========================

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

==========================
ABOUT
==========================

Use Public Lab's Map Knitter to upload your own aerial imagery and combine it into a GeoTiff and TMS/OpenLayers map.

Read more about Map Knitter at: http://publiclab.org/wiki/plots-map-toolkit

The Public Laboratory for Open Technology and Science (Public Lab) is a community which develops and applies open-source tools to environmental exploration and investigation. By democratizing inexpensive and accessible “Do-It-Yourself” techniques, Public Lab creates a collaborative network of practitioners who actively re-imagine the human relationship with the environment.

The core Public Lab program is focused on “civic science” in which we research open source hardware and software tools and methods to generate knowledge and share data about community environmental health. Our goal is to increase the ability of underserved communities to identify, redress, remediate, and create awareness and accountability around environmental concerns. Public Lab achieves this by providing online and offline training, education and support, and by focusing on locally-relevant outcomes that emphasize human capacity and understanding.

Join now at: http://publiclab.org

==========================
PREREQUISITES
==========================

Recommended; for an Ubuntu/Debian system. Varies slightly for mac/fedora/etc

Install a database, if necessary:

`sudo apt-get install mysql-server`

Application-specific dependencies:

`sudo apt-get install bundler curl gdal-bin imagemagick ruby-rmagick s3cmd install libfreeimage3 libfreeimage-dev ruby-dev librmagick-ruby libmagickcore-dev libmagickwand-dev python-gdal zip libopenssl-ruby libcurl4-openssl-dev libssl-dev libmysqlclient-dev`

Install rvm for Ruby management (http://rvm.io)

`curl -L https://get.rvm.io | bash -s stable`

# you may need to enable 'Run command as a login shell' in Ubuntu's Terminal, under Profile Preferences > Title and Command. Then close the terminal and reopen it.

`rvm install 2.1.2`

==========================
INSTALLATION
==========================

You'll need Ruby 1.9.3-2.1.x and GDAL >=1.7.x (gdal.org), as well as ImageMagick (see above)

1. Download source from https://github.com/publiclab/mapknitter
2. Install gems with `bundle install` from the rails root folder. You may need to run `bundle update` if you have older gems in your environment.
3. [if necessary] Install npm with `sudo apt-get install npm` and bower [globally] with `sudo npm install -g bower`
4. Install static dependencies with `bower install`.
5. Copy and configure config/database.yml from config/database.yml.example
6. Copy and configure config/config.yml from config/config.yml.example
7. Initialize database with "rake db:migrate"
8. (Not necessary for basic development) Enter the ReCaptcha public and private keys in config/initializers/recaptcha.rb, copied from recaptcha.rb.example
7. Start rails with "passenger start" from the Rails root and open http://localhost:3000 in a web browser.

==========================
BUGS AND SUPPORT
==========================

To report bugs and request features, please use the GitHub issue tracker provided at https://github.com/publiclab/mapknitter/issues 

For additional support, join the Public Lab website and mailing list at http://publiclab.org/lists or for urgent requests, email web@publiclab.org

For questions related to the use of this software and balloon or kite mapping, the same page links to the "grassrootsmapping" discussion group. 

==========================
DEVELOPERS
==========================

Development is occurring at https://github.com/publiclab/mapknitter/; please fork and submit pull requests.

If you're a developer, consider joining the Public Lab developer list, also at http://publiclab.org/lists 



