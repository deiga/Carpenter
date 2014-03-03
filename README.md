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

### Requirements

* node
* npm
* `npm install -g sails`
* `npm install -g bower`
* Run `npm install` for dependencies

### Database

* Use Firebase for all data storage needs
  * Downside: no offline access
  * Upside: No need for DB schemas etc
* Use MongoDB to store users and games
* Cache simple values in DB (steamnick => steamid, gameid => gamename, etc.)
  * Either use the (more bulky) mongodb for cachestore
  * Or use Redis for caching needs
