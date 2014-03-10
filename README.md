Carpenter
=========
[![Build Status](https://travis-ci.org/deiga/Carpenter.png?branch=dev)](https://travis-ci.org/deiga/Carpenter) [![Dependency Status](https://david-dm.org/deiga/Carpenter.png)](https://david-dm.org/deiga/Carpenter)

Repo for [NodeJS project](https://github.com/tuhoojabotti/NodeJS-ohjelmointiprojekti-k2014) at [University of Helsinki](https://www.cs.helsinki.fi/)

## Overview

Carpenter is a  webapp which allows you to input a list of steam nicknames and outputs the games these people share. You can also search common games for a group and login with Steam openID. In the future, this openID-login will enable you to also add non-Steam games to your list as well as let you see a list of people who share some games with you, organized by the games. So, when you login with your Steam ID you will in the future get a view of your Steam and possible non-Steam games, and with each game all your friends, who also own that game, would be listed under the game.

## Features

* Given a list of Steam nicks/ids, show a 'list' of games the users have in common
* Input steamgroup name and get a 'list' of games the members have in common
* Login through steam and display friends grouped under games you all possess. (Future development)
* Persist users and add non-steam-owned games to users (Future development)


## User mañuel

### Steam login

* Hit the image which says 'login through Steam'. You will be taken to a Steam login page, and after a successful login, returned to our page, where you will currently be able to see your own games

### Search common games for...

#### list of users

* You need to know each user's Steam account name or their vanity URL (steamcommunity.com/id/foo where foo is the vanityURL for user)
* Hit the top navigation link titled 'find common games'
* Input list of names in the first textbox, delimited by comma

#### a group

* Go to the same place as with a list of usernames
* Input group name to second textbox
* Hit search

## Technical details

### Database

* Use MongoDB to store users and games
* Cache simple values in DB (steamnick => steamid, gameid => gamename, etc.)
* Frontend is jade

### Development

* Install `node` (Preferably 0.10.x, 0.11.x should work too)
  * `nvm` is a great tool for handling `node` versions (Use to install node with it)
* Install `npm` if needed (`curl https://npmjs.org/install.sh | sh` Is preferable to package manage risntallation)
* Install development dependencies `npm install -g sails bower grunt-cli`
* Install project dependencies with `npm install` inside project directory
* Get a [Steam API key](https://steamcommunity.com/dev/apikey) and place it in a file called .env in your project root as STEAM_API_KEY. E.g. STEAM_API_KEY=yourkey


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
