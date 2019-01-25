/**
 *Rovers can rotate and move
 *
 * @class Rover
 */
class Rover {
  /**
   *Creates an instance of Rover
   * @param {object} config that contains location [x, y] and direction
   * @memberof Rover
   */
  constructor (config) {
    if (typeof config !== 'object') {
      throw new Error('must provide a config to create rover')
    }
    const { location, direction } = config
    if (!location || typeof direction === 'undefined') {
      throw new Error('rover must have location and direction')
    }
    if (!Array.isArray(location) || location.length < 2) {
      throw new Error('location must be an array [x, y]')
    }
    if (!location.every(Number.isInteger)) {
      throw new Error('location [x, y] must both be integers')
    }
    /*
      directions:
        0: north
        1: east
        2: south
        3: west
    */
    this.direction = direction % 4
    this.location = location
  }
  /**
   *Rotates a rover 90 degrees left or right
   *
   * @param {number} direction 1 for 90 degrees, -1 for -90 degrees
   * @memberof Rover
   */
  rotate (direction) {
    if (!Number.isInteger(direction)) {
      throw new Error('integer direction to rotate is required')
    }
    if (direction < -1 || direction > 1) {
      throw new Error('direction must be -1 or 1 (left or right)')
    }
    this.direction = (this.direction + direction + 4) % 4
  }
  /**
   *Moves a rover one unit in its current direction
   *
   * @param {object} config with optional reverse parameter
   * @memberof Rover
   */
  move (config) {
    const { reverse } = config || {}
    // moving left means [x, y] -> [x-1, y]
    // moving right means [x, y] -> [x+1, y]
    // moving up means [x, y] -> [x, y+1]
    // moving down means [x, y] -> [x, y-1]
    let nextLocation = this.location
    if (this.direction % 2 === 0) {
      // if we are facing north or south
      // translate 0, 2 into -1, 1
      let offset = (this.direction - 1) * (reverse ? -1 : 1)
      nextLocation = [this.location[0], this.location[1] - offset]
    } else {
      // if we are facing west or east
      // translate 1 or 3 into -1, 1
      let offset = (this.direction - 2) * (reverse ? -1 : 1)
      nextLocation = [this.location[0] - offset, this.location[1]]
    }
    if (nextLocation.some(n => n < 0)) {
      throw new Error('cannot move into negative coordinates')
    }
    this.location = nextLocation
  }
}

module.exports = Rover
