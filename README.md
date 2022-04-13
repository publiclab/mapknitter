## MapKnitter

[![Code of Conduct](https://img.shields.io/badge/code-of%20conduct-green.svg)](https://publiclab.org/conduct)
[![Build Status](https://github.com/publiclab/mapknitter/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/publiclab/mapknitter/actions)
[![codecov](https://codecov.io/gh/publiclab/mapknitter/branch/main/graph/badge.svg)](https://codecov.io/gh/publiclab/mapknitter)
[![Join the chat at https://publiclab.org/chat](https://img.shields.io/badge/chat-in%20different%20ways-blue.svg)](https://publiclab.org/chat)
[![first-timers-only-friendly](http://img.shields.io/badge/first--timers--only-friendly-blue.svg?style=flat-square)](https://code.publiclab.org#r=all)
[![View performance data on Skylight](https://badges.skylight.io/typical/ArYnJAb3VUC9.svg?token=DJ-zenCIFAootUAeQ8BkTiTkMBXkNpNc-PXTLA4dqDU)](https://www.skylight.io/app/applications/ArYnJAb3VUC9)

Use Public Lab's open source MapKnitter to upload your own aerial photographs (for example those from balloon or kite mapping: http://publiclab.org/balloon-mapping) and combine them into:

-   Web "slippy maps" like Google Maps
-   GeoTiff
-   TMS
-   High resolution JPEG

![demo](https://raw.githubusercontent.com/publiclab/mapknitter/master/public/demo.gif)

## Table of Contents

- [MapKnitter](#mapknitter)
- [Table of Contents](#table-of-contents)
- [Architecture](#architecture)
- [Installation](#installation)
- [Cloud Installation](#cloud-installation)
- [Standard Installation](#standard-installation)
  - [Prerequisites for Standard Installation](#prerequisites-for-standard-installation)
    - [MySQL](#mysql)
    - [RVM](#rvm)
    - [Yarn](#yarn)
  - [Installation Steps](#installation-steps)
  - [Installation video](#installation-video)
- [Windows Installation](#windows-installation)
- [Logging in when running locally](#logging-in-when-running-locally)
- [Running tests](#running-tests)
    - [Running tests of a specific file:](#running-tests-of-a-specific-file)
    - [Running a single test from the test suite:](#running-a-single-test-from-the-test-suite)
- [Bugs and support](#bugs-and-support)
  - [Code of Conduct](#code-of-conduct)
- [Developers](#developers)
- [Staging infrastructure and testing](#staging-infrastructure-and-testing)
- [License](#license)
- [MapKnitter in depth](#mapknitter-in-depth)

---

## Architecture

MapKnitter is broken into three major components:

1. Map user interface
2. Application
3. Exporting system

**Component 1** has been broken out into a new Leaflet plugin, [Leaflet.DistortableImage](https://github.com/publiclab/Leaflet.DistortableImage/), which allows for client-side, CSS3-based distortion of images over a Leaflet base map

**Component 2** is a Ruby on Rails application which is the core of what you've looked at. It stores images, image corner locations, annotations, map details, and user accounts.

**Component 3** is a set of calls to an external application, MapKnitter Exporter, which performs the distortions, geolocations, and produce export products like GeoTiff, TMS, jpg, etc. The external exporter service is built in a small Sinatra app at [mapknitter-exporter-sinatra](https://github.com/publiclab/mapknitter-exporter-sinatra) using the [mapknitter-exporter](https://github.com/publiclab/mapknitter-exporter) gem. Requests for exports are sent and progress is tracked using the API.

## Installation

Please consider which installation method you prefer. Cloud Installation requires fewer steps and is platform agnostic, but you may value working from your terminal, for familiarity, more.

-   [Cloud Installation](#Cloud-Installation)
-   [Standard Installation](#Standard-Installation)
-   [Windows Installation](#Windows-Installation)

<hr>

## Cloud Installation

Cloud installation is possible with GitPod, using this link; it should be fully automated:

> https://gitpod.io/#https://github.com/publiclab/mapknitter

<hr>

## Standard Installation

<hr>

### Prerequisites for Standard Installation

Make sure you have the below 3 prerequisites installed before moving forward with the [Installation Steps](#Installation-Steps).

Instructions are for an Ubuntu/Debian system. Varies slightly for mac/fedora/etc.

Mac OS 10.14 users may need this: https://silvae86.github.io/2018/07/05/fixing-missing-headers-for-homebrew-in-mac-osx-mojave/

1. [MySQL](#MySQL) - Database
2. [RVM](#RVM) - Ruby version manager
3. [Yarn](#Yarn) - Package manager

#### MySQL

MacOS and Linux users, please reference [MYSQL.md](MYSQL.md) instead.

1. Install MYSQL:

```Bash
$ sudo apt-get install mysql-server
```

2. Application-specific dependencies:

```Bash
$ sudo apt-get install bundler libmysqlclient-dev imagemagick ruby-rmagick libfreeimage3 libfreeimage-dev ruby-dev libmagickcore-dev libmagickwand-dev
```

3. _(Optional)_: For exporting, you'll need GDAL >=1.7.x (gdal.org), as well as `curl` and `zip`-- but these are not needed for much of development, unless you're working on the exporting features.

```Bash
$ sudo apt-get install gdal-bin python-gdal curl libcurl4-openssl-dev libssl-dev zip
```

==================

#### RVM

This is for RVM, but the alternative, **rbenv**, also works (instructions not listed here). Don't install RVM if you already have rbenv!

1. Install RVM: (http://rvm.io)

```Bash
$ curl -L https://get.rvm.io | bash -s stable
```

2. At this point during the process, you may want to log out and log back in, or open a new terminal window; RVM will then properly load in your environment.

    - _Ubuntu users only:_ You may need to enable `Run command as a login shell` in Ubuntu's Terminal, under Profile Preferences > Title and Command. Then close the terminal and reopen it.

3. Use RVM to install version 2.4.6 of Ruby:

    - _macOS Big Sur users only:_ You may encounter a `Error running '__rvm_make -j8'` compilation error while installing Ruby with RVM. Run `export warnflags=-Wno-error=implicit-function-declaration` and then retry the installation command below. if you still encounter issues, [this thread](https://github.com/rvm/rvm/issues/5033) provides very helpful suggestions.

```Bash
$ rvm install 2.4.6
```

==================

#### Yarn

We use Yarn as our package manager, which is available through npm.

1. Install npm:

```Bash
$ sudo apt-get install npm
```

2. _Ubuntu users only_: you may need to also install the `nodejs-legacy` package, as due to a naming collision, some versions of Ubuntu already have an unrelated package called `node`. To do this, run:

```Bash
$ sudo apt-get install nodejs-legacy
```

3. Once npm is installed, you should be able to use it to install Yarn:

```Bash
$ npm install -g yarn
```

NOTE: Refer [this](https://stackoverflow.com/questions/16151018/npm-throws-error-without-sudo) in case NPM throws permission errors

==================

### Installation Steps

You'll need Ruby v2.4.6 (use your local ruby version management system - RVM or rbenv - to install and set up locally).

1. Fork the repo from `https://github.com/publiclab/mapknitter`
2. Clone the forked repo into any fresh, temporary folder with `git clone https://github.com/your_username/mapknitter.git`
3. Change your working directory into the root folder you just cloned locally with `cd <folder-name>`
4. Add upstream with `git remote add upstream https://github.com/publiclab/mapknitter.git`
5. Install gems with `bundle install`. You may need to run `bundle update` if you have older gems in your environment.
6. Copy and configure config/database.yml from config/database.yml.example using a new empty database you've created.
7. Copy and configure config/config.yml from config/config.yml.example. For now, this is used for adding the [Google Maps API Key](http://stackoverflow.com/questions/2769148/whats-the-api-key-for-in-google-maps-api-v3) configurations and a path for [logging in when running locally](https://github.com/publiclab/mapknitter/blob/main/README.md#logging-in-when-running-locally). Both are optional.
8. Initialize database with `bundle exec rails db:setup`
9. Enter ReCaptcha public and private keys in config/initializers/recaptcha.rb (copied from config/initializers/recaptcha.rb.example). To get keys, visit https://www.google.com/recaptcha/admin/create
10. Install static assets (like external javascript libraries and fonts) with `yarn install`
11. Start rails with `bundle exec rails s` and open http://localhost:3000 in a web browser. For some, just `rails s` will work; adding `bundle exec` ensures you're using the version of passenger you just installed with Bundler.

==================

### Installation video

For a run-through of the Prerequisites and Installation steps listed below, you can watch the install video at:

http://youtu.be/iGYGpS8rZMY (may be slightly out of date, but gives an overview)

<hr>

## Windows Installation

We recommend you either work in a virtual environment, or on a dual booted system to avoid dependencies issues and also Unix system works smoother with Ruby and Rails. This will not only benefit you now for Mapknitter, but also in future while working on other Ruby projects, a Linux or Mac OS will make your life easier.

1. [Dual Booting](https://www.tecmint.com/install-ubuntu-alongside-with-windows-dual-boot/amp/), [option2](https://askubuntu.com/questions/1031993/how-to-install-ubuntu-18-04-alongside-windows-10), [video guide](https://www.youtube.com/watch?v=qNeJvujdB-0&fbclid=IwAR0APhs89jlNR_ENKbSwrp6TI6P-wxlx-a0My9XBvPNAfwtADZaAXqcKtP4)
2. [Setting up a linux virtual env](https://itsfoss.com/install-linux-in-virtualbox/)

<hr>

## Logging in when running locally

Because MapKnitter uses a remote OpenID login system that depends on PublicLab.org, it can be hard to log in when running it locally. To get around this, we've created a local login route that requires no password:

You can log in locally at the path `http://localhost:3000/local/USERNAME` where `USERNAME` is any username.

For this to work:

-   You will need to have copied and configured config/config.yml from config/config.yml.example

-   The user has to be an existing record. For your convenience, we have added two user accounts in [seeds.rb](./db/seeds.rb) to make their corresponding paths available in development after installation:

```Ruby
# basic account path - http://localhost:3000/local/harry
# created from:
User.create({login: 'harry', name: 'harry potter', email: 'potter@hogwarts.com'})

# admin account path - http://localhost:3000/local/albus
# created from:
u_admin = User.create({login: 'albus', name: 'albus dumbledore', email: 'dumbledore@hogwarts.com', role: 'admin'})
```

## Running tests

When you try to run tests in MapKnitter, you can run the default Rake tasks, such as:

`rails test:unit` `rails test:controllers` `rails test:integration`

or simply:

`rails test`

#### Running tests of a specific file:

`rails test test/unit/some_file.rb`

#### Running a single test from the test suite:

`rails test test/functional/some_file.rb:[line number of the test]`

## Bugs and support

To report bugs and request features, please use the GitHub issue tracker provided at https://github.com/publiclab/mapknitter/issues

For additional support, join the Public Lab website and mailing list at http://publiclab.org/lists or for urgent requests, email web@publiclab.org

For questions related to the use of this software and balloon or kite mapping, the same page links to the "grassrootsmapping" discussion group.

### Code of Conduct

Please read and abide by our [Code of Conduct](https://github.com/publiclab/mapknitter/blob/main/CODE_OF_CONDUCT.md); our community aspires to be a respectful place both during online and in-­person interactions.

## Developers

Help improve Public Lab software!

-   Join the 'plots-dev@googlegroups.com' discussion list to get involved
-   Look for open issues at https://github.com/publiclab/mapknitter/issues
-   Review contributor guidelines at http://publiclab.org/wiki/contributing-to-public-lab-software
-   Some devs hang out in http://publiclab.org/chat (irc webchat)
-   Find lots of info on contributing at http://publiclab.org/wiki/developers
-   Join our gitter chat at https://gitter.im/publiclab/publiclab

## Staging infrastructure and testing

In addition automatic testing with Travis CI - we have a branch (`unstable`) is set to auto-build and deploy to [a staging instance](http://mapknitter-unstable.laboratoriopublico.org/). This instance includes a copy of the production database and is intended for experimenting or debugging purposes with a production-like environment. We also have a `stable` build at http://mapknitter-stable.laboratoriopublico.org/ which builds off of our `main` branch. Any commits or PRs merged to the main branch will trigger the `stable` server to rebuild; you can monitor progress at https://jenkins.laboratoriopublico.org/

---

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

---

## MapKnitter in depth

MapKnitter is a free and open source software created and run by Public Lab. MapKnitter is hosted through a donation of server space by Rackspace.

MapKnitter can make maps from any image source, but it particularly lends itself to making maps with balloons and kites. The manual process of making maps with MapKnitter differs greatly from automated aerial imaging systems. In those systems, the imaging is of higher precision and processed with spatial and telemetry data collected along with the imagery, typically at higher altitudes and with consistent image overlap in the flight path sequence.

With MapKnitter the cartographer dynamically places each image and selects which images to include in the mosaic. Although the approaches are similar in that they use some type of additional information (usually pre-existing imagery of a lower resolution) as a reference, and that they are bound to specific cartographic elements such as map scale and map projection.
