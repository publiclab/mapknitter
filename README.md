## MapKnitter 

[![Code of Conduct](https://img.shields.io/badge/code-of%20conduct-green.svg)](https://publiclab.org/conduct)
[![codecov](https://codecov.io/gh/publiclab/mapknitter/branch/main/graph/badge.svg)](https://codecov.io/gh/publiclab/mapknitter) 
[![View performance data on Skylight](https://badges.skylight.io/typical/ArYnJAb3VUC9.svg?token=DJ-zenCIFAootUAeQ8BkTiTkMBXkNpNc-PXTLA4dqDU)](https://www.skylight.io/app/applications/ArYnJAb3VUC9)

Use Public Lab's open source MapKnitter to upload your own aerial photographs (for example those from balloon or kite mapping: http://publiclab.org/balloon-mapping) and combine them into:

* Web "slippy maps" like Google Maps
* GeoTiff
* TMS
* High resolution JPEG

![demo](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

## Table of Contents
1. [Architecture](#architecture)
2. [Installation](#installation)
	- [Quick Installation](#quick-installation)
	- [Installation Video](#installation-video)
	- [Prerequisites](#prerequisites)
	- [Standard Installation](#standard-installation)
3. [Logging in when running locally](#logging-in-when-running-locally)
4. [Bugs and support](#bugs-and-support)
5. [Developers](#developers)
6. [Staging infrastructure and testing](#staging-infrastructure-and-testing)
7. [License](#license)


****

## Architecture

MapKnitter is broken into three major components:

1. Map user interface
2. Application
3. Exporting system

**Component 1** has been broken out into a new Leaflet plugin, [Leaflet.DistortableImage](https://github.com/publiclab/Leaflet.DistortableImage/), which allows for client-side, CSS3-based distortion of images over a Leaflet base map

**Component 2** is a Ruby on Rails application which is the core of what you've looked at. It stores images, image corner locations, annotations, map details, and user accounts. 

**Component 3** is a set of calls to GDAL (Geospatial Data Abstraction Library) and ImageMagick, which perform the distortions, geolocations, and produce export products like GeoTiff, TMS, jpg, etc. These are baked into the Warpable and Map models, as well as the Export controller, and could use some consolidation. 

Component 3 is soon to be replaced with an external exporter service built in a small Sinatra app called [mapknitter-exporter-sinatra](https://github.com/publiclab/mapknitter-exporter-sinatra) using the [mapknitter-exporter](https://github.com/publiclab/mapknitter-exporter) gem.

Another moving part is the new-ish Annotations 2.0 which uses [Leaflet.Illustrate](https://github.com/manleyjster/Leaflet.Illustrate) to provide rich annotation on top of maps. 

## Installation

### Quick install

We provide an install script for Codenvy's cloud service, which provides a developer workspace server that allows anyone to contribute to a project without installing software: https://Codenvy.io.

To use it:

1. Create a personal account.
2. Click `Create new workspace`.
3. Select a new workspace with a blank stack.
4. Add the URL of your forked version of mapknitter under the `projects` section (`https://github.com/USERNAME/mapknitter`).
5. Hit create.
6. It will open in the projects explorer - use the `bash` console at the bottom of the screen to `cd` into this project's directory. 
7. Run the installation script. The initial installation may take a bit.
```Bash
$ source install_cloud.sh 
```
8. When you see it's complete, to run the server:
```Bash 
$ source start.sh
```
9. Open the URL which pops up to see MapKnitter booted up. Great work!

### Installation video

For a run-through of the Prerequisites and Installation steps listed below, you can watch the install video at:

http://youtu.be/iGYGpS8rZMY (may be slightly out of date, but gives an overview)

### Prerequisites

Recommended; for an Ubuntu/Debian system. Varies slightly for mac/fedora/etc.

#1 **MySQL**

MacOS and Linux users, please reference [MYSQL.md](MYSQL.md) instead.

Install a database, if necessary. sqlite does not seem to work due to some table constraints:

```Bash
sudo apt-get install mysql-server
```


Application-specific dependencies:

`sudo apt-get install bundler libmysqlclient-dev imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev`

(optional) For exporting, you'll need GDAL >=1.7.x (gdal.org), as well as `curl` and `zip`-- but these are not needed for much of development, unless you're working on the exporting features. 

  ```Bash
  sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
  ```

==================


#2 **Ruby version manager** - **RVM / Rbenv**

This is for RVM, but the alternative, Rbenv, also works (instructions not listed here). Don't install RVM if you already have Rbenv!

Install RVM for Ruby management (http://rvm.io)

```Bash
curl -L https://get.rvm.io | bash -s stable
```

**Note:** At this point during the process, you may want to log out and log back in, or open a new terminal window; RVM will then properly load in your environment. 

**Ubuntu users:** You may need to enable `Run command as a login shell` in Ubuntu's Terminal, under Profile Preferences > Title and Command. Then close the terminal and reopen it.

Then, use RVM to install version 2.4.6 of Ruby:
  ```Bash
rvm install 2.4.6
  ```

==================

#3 **Package manager - Npm and Yarn** 

You'll also need **yarn** which is available through NPM. To install npm, you can run:
  ```Bash
  sudo apt-get install npm
  ```

However, on Ubuntu, you may need to also install the `nodejs-legacy` package, as due to a naming collision, some versions of Ubuntu already have an unrelated package called `node`. To do this, run:
  ```Bash
  sudo apt-get install nodejs-legacy
  ```

Once NPM is installed, you should be able to run:
```Bash
sudo npm install -g yarn
```

  ==================

### Standard Installation

You'll need Ruby v2.4.6 (use your local ruby version management system - RVM / rbenv / etc. - to install and set locally)

1. Download a copy of the source with `git clone https://github.com/publiclab/mapknitter.git` 
2. Install gems with `bundle install` from the rails root folder. You may need to run `bundle update` if you have older gems in your environment.
3. Copy and configure config/database.yml from config/database.yml.example, using a new empty database you've created
4. Copy and configure config/config.yml from config/config.yml.example (for now, this is only for the [Google Maps API Key, which is optional](http://stackoverflow.com/questions/2769148/whats-the-api-key-for-in-google-maps-api-v3), and a path for [logging in when running locally, also optional](#Logging-in-when-running-locally))
5. Initialize database with `bundle exec rake db:setup`
6. Enter ReCaptcha public and private keys in config/initializers/recaptcha.rb, copied from recaptcha.rb.example. To get keys, visit https://www.google.com/recaptcha/admin/create
7. Install static assets (like external javascript libraries, fonts) with `yarn install` 
8. Start rails with `bundle exec passenger start` from the Rails root and open http://localhost:3000 in a web browser. (For some, just `passenger start` will work; adding `bundle exec` ensures you're using the version of passenger you just installed with Bundler.)

### Running tests

When you try to run tests in MapKnitter, you can run the default Rake tasks, such as:

`rake test:units`
`rake test:functionals`
`rake test:integration`

or simply:

`rake test`

By running like this you'll see a lot of warnings and deprecation notices - FOR NOW -, but we're working on them. If you'd like a cleaner visual of your tests, you can just use our custom defined task:

`rake test:all`

## Logging in when running locally

Because MapKnitter uses a remote OpenID login system that depends on PublicLab.org, it can be hard to log in when running it locally. To get around this, we've created a local login route that requires no password:

You can log in locally at the path `http://localhost:3000/local/USERNAME` where `USERNAME` is any username.

For this to work:

 - You will need to have copied and configured config/config.yml from config/config.yml.example

 - The user has to be an existing record. For your convenience, we have added two user accounts in [seeds.rb](./db/seeds.rb) to make their corresponding paths available in development after installation:

```Ruby
# basic account path - http://localhost:3000/local/harry
# created from:
User.create({login: 'harry', name: 'harry potter', email: 'potter@hogwarts.com'})

# admin account path - http://localhost:3000/local/albus
# created from:
u_admin = User.create({login: 'albus', name: 'albus dumbledore', email: 'dumbledore@hogwarts.com'})
u_admin.role = 'admin'
```

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
* Find lots of info on contributing at http://publiclab.org/wiki/developers
* Join our gitter chat at https://gitter.im/publiclab/publiclab

## Staging infrastructure and testing

In addition automatic testing with Travis CI - we have a branch (`unstable`) is set to auto-build and deploy to [a staging instance](http://mapknitter-unstable.laboratoriopublico.org/). This instance includes a copy of the production database and is intended for experimenting or debugging purposes with a production-like environment. We also have a `stable` build at http://mapknitter-stable.laboratoriopublico.org/ which builds off of our `main` branch. Any commits or PRs merged to the main branch will trigger the `stable` server to rebuild; you can monitor progress at https://jenkins.laboratoriopublico.org/

****

## License

MapKnitter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MapKnitter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with MapKnitter. If not, see <http://www.gnu.org/licenses/>.
