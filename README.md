# mars rovers

## how to run
- install [Node & NPM](https://nodejs.org) >= 9
- install dependencies by running `npm install` in this directory
- start CLI by running `npm start` in this directory
- run tests by running `npm test` in this directory

## project structure

**index.js** - small UI to either parse and run an input file or to manually create rovers on a plateau

**src/controller.js** - RoverController class; handles keeping track of rovers on plateau and having them run rotate/move commands

**src/rover.js** - Rover class; handles rotating and moving

**src/util.js** - Utilities to parse input files

## License
MIT