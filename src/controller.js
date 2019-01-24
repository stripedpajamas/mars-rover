const Rover = require('./rover')

class RoverController {
  constructor (config) {
    if (typeof config !== 'object') {
      throw new Error('must provide a config to create controller')
    }
    const { dimensions } = config
    this.dimensions = dimensions
    this.rovers = []
  }
  addRover (location, direction) {
    if (!this.isValidLocation(location)) {
      throw new Error('invalid initial location for rover')
    }
    let rover = new Rover({ location, direction })
    let id = this.rovers.push(rover) - 1
    return id
  }
  removeRover (id) {
    if (id < 0 || id >= this.rovers.length) {
      throw new Error('invalid rover id')
    }
    this.rovers.splice(id)
  }
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
  isValidLocation (location) {
    return Array.isArray(location) && location.length === 2 &&
      location.every((n, i) => n >= 0 && n <= this.dimensions[i])
  }
}

module.exports = RoverController
