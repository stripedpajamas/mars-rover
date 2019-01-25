const Rover = require('./rover')

/**
 * Controls rovers on a plateau
 * @class RoverController
 */
class RoverController {
  /**
   *Creates an instance of RoverController
   *
   * @param {object} config should contain dimensions property [w, h]
   * @memberof RoverController
   */
  constructor (config) {
    if (typeof config !== 'object') {
      throw new Error('must provide a config to create controller')
    }
    const { dimensions } = config
    if (dimensions.some(x => x < 0)) {
      throw new Error('width and height must be positive')
    }
    this.dimensions = dimensions
    this.rovers = []
  }
  /**
   *Adds a rover to the plateau
   *
   * @param {array} location the initial location of the rover as [x, y]
   * @param {number} direction the initial direction of the rover N:0, E:1, S:2, W:3
   * @returns {number} the id of the added rover
   * @memberof RoverController
   */
  addRover (location, direction) {
    if (!this.isValidLocation(location)) {
      throw new Error('invalid initial location for rover')
    }
    let rover = new Rover({ location, direction })
    let id = this.rovers.push(rover) - 1
    return id
  }
  /**
   *Removes a rover from the plateau
   *
   * @param {number} id the id of the rover to remove
   * @memberof RoverController
   */
  removeRover (id) {
    if (id < 0 || id >= this.rovers.length) {
      throw new Error('invalid rover id')
    }
    this.rovers.splice(id, 1)
  }
  /**
   *Runs a set of commands on a particular rover
   *
   * @param {number} id the id of the rover on which to run the commands
   * @param {array} commands an array of well formed commands {command, value}
   * @returns {object} the updated location and direction of the rover {location, direction}
   * @memberof RoverController
   */
  runCommands (id, commands) {
    if (id < 0 || id >= this.rovers.length) {
      throw new Error('invalid rover id')
    }
    let rover = this.rovers[id]
    commands.forEach((command) => {
      switch (command.command) {
        case 'rotate': {
          rover.rotate(command.value)
          break
        }
        case 'move': {
          rover.move()
          if (!this.isValidLocation(rover.location)) {
            rover.move({ reverse: true })
            throw new Error('cannot move off plateau')
          }
          break
        }
        default: {
          throw new Error('invalid rover command')
        }
      }
    })
    let location = rover.location
    let direction = rover.direction
    return { location, direction }
  }
  /**
   *Checks if a given location is on the plateau
   *
   * @param {array} location [x, y]
   * @returns {boolean}
   * @memberof RoverController
   */
  isValidLocation (location) {
    return Array.isArray(location) && location.length === 2 &&
      location.every((n, i) => n >= 0 && n <= this.dimensions[i])
  }
}

module.exports = RoverController
