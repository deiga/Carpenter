Carpenter
=========

Repo for [NodeJS project](https://github.com/tuhoojabotti/NodeJS-ohjelmointiprojekti-k2014) at [University of Helsinki](https://www.cs.helsinki.fi/)

## Topic

It's an webapp which allows you to input a list of steam nicknames and it will output the games these people share

## Features

* Input list of Steam nick/id values and show a 'list' of games they have in common
* Input steamgroup name and get a 'list' of games the members have in common
* Login thorugh steam and display groups of friends which have games in common
* Persist users and add non-steam owned games to users


## Technical details

### Database

* Use Firebase for all data storage needs
  * Downside: no offline access
  * Upside: No need for DB schemas etc
* Use MongoDB to store users and games
* Cache simple values in DB (steamnick => steamid, gameid => gamename, etc.)
  * Either use the (more bulky) mongodb for cachestore
  * Or use Redis for caching needs
