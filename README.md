Carpenter
=========

Repo for [NodeJS project](https://github.com/tuhoojabotti/NodeJS-ohjelmointiprojekti-k2014) at [University of Helsinki](https://www.cs.helsinki.fi/)

## Overview

Carpenter is a  webapp which allows you to input a list of steam nicknames and outputs the games these people share.  

## Features

* Given a list of Steam nicks/ids, show a 'list' of games the users have in common
* Input steamgroup name and get a 'list' of games the members have in common
* Login through steam and display friends grouped under games you all possess.
* Persist users and add non-steam-owned games to users


## Technical details

### Database

* Use Firebase for all data storage needs
  * Downside: no offline access
  * Upside: No need for DB schemas etc
* Use MongoDB to store users and games
* Cache simple values in DB (steamnick => steamid, gameid => gamename, etc.)
  * Either use the (more bulky) mongodb for cachestore
  * Or use Redis for caching needs

### Development

* Install `node` (Preferably 0.10.x, 0.11.x should work too)
  * `nvm` is a great tool for handling `node` versions (Use to install node with it)
* Install `npm` if needed (`curl https://npmjs.org/install.sh | sh` Is preferable to package manage risntallation)
* Install development dependencies `npm install -g sails bower grunt-cli`
* Install project dependencies with `npm install` inside project directory


## Misc

* Running server: `sails lift`
* Application console: `sails console`
* Generate application model/controller: `sails generate (model|controller) <foo>`
* Adding dependencies
  * backend
    * dependency for development `npm install <foo> --save-dev`
    * dependency `npm install <foo> --save`
  * frontend
    * dependency  `bower install <foo> --save`
    * dependency for development `bower install <foo> --save-dev`
