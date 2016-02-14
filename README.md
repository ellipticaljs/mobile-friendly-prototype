MOBILE FRIENDLY PROTOTYPE
===========================

A responsive, web-components starter-kit.


##Install

``` bash

git clone https://github.com/ellipticaljs/mobile-friendly-prototype.git
mv mobile-friendly-prototype my-project
cd my-project
npm install
bower install

```

##Tasks

``` bash
gulp start-live

```

##Browser

``` bash
http://localhost:9040/

```

##Demo

http://ellipticaljs.github.io/mobile-friendly-prototype/


## Available Gulp Tasks

``` bash
# start live server only
gulp start-live-server

# start server only
gulp start-server

# start live server, watch scripts, watch sass
gulp start-live

# start server, watch scripts, watch sass
gulp start

# start live server, watch javascript app, watch sass
gulp start-live-app

# start server, watch javascript app, watch sass
gulp start-app

# start live server, watch sass only
gulp start-live-sass

# start server, watch sass only
gulp start-sass

# start live server, watch javascript app only
gulp start-live-app-no-sass

# start server, watch javascript app only
gulp start-app-no-sass

# start live server, watch scripts only
gulp start-live-scripts

# start server, watch scripts only
gulp start-scripts

# watch sass
gukp sass-watch

# one-time compile sass
gulp sass-compile

# watch app
gulp app-watch

# watch scripts
gulp scripts-watch

# build app
gulp app-build

# build scripts
gulp scripts-build

# build app html imports file
gulp app-build-imports

# watch app html imports
gulp app-watch-imports

# vulcanize imports
gulp-vulcanize

```

## Config.json File

``` bash
# json file props

# path to sass app file
sassApp

# sass src files path
sassSrc

# css destination path
cssDest

# dev server root path
devPath

# dev server port
devPort

# live server port
livePort

# live server root path
livePath

# live host
liveHost

# app scripts pah
appScriptPath

# scripts src path
scriptSrc

# scripts dest path
scriptDest

# html imports src path
importSrc

# vulcanized dest path
vulcanDest

# strip excludes from vulcanized file
stripExcludes

# inline scripts in vulcanized file
inlineScripts


```


## Additional Notes on Html Imports and Vulcanization

The prototype implements the web component standard for UI elements. This includes the Html Imports spec. Because Chromium is the only borwser that currently
implements the W3C spec, it is important to vulcanize the front-end assets for the web app to run efficiently(or even correctly) given the number of bower dependencies.
The strategy is simple: instead of
