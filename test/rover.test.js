/* global describe, it, beforeEach */
const assert = require('assert')
const Rover = require('../src/rover')

describe('Rover', () => {
  describe('#constructor', () => {
    it('should set direction and location', () => {
      let rover = new Rover({ location: [0, 0], direction: 1 })
      assert.deepStrictEqual(rover.location, [0, 0])
      assert.deepStrictEqual(rover.direction, 1)
    })
    it('should require a config object to construct', () => {
      assert.throws(() => new Rover(), /must provide a config to create rover/)
    })
    it('should require both direction and location', () => {
      assert.throws(() => new Rover({ location: [0, 0] }), /rover must have location and direction/)
      assert.throws(() => new Rover({ direction: 0 }), /rover must have location and direction/)
    })
    it('should require location to be an [x, y] array', () => {
      assert.throws(() => new Rover({ location: [], direction: 0 }), /location must be an array \[x, y\]/)
      assert.throws(() => new Rover({ location: [0], direction: 0 }), /location must be an array \[x, y\]/)
    })
    it('should require location to be integers', () => {
      assert.throws(() => new Rover({ location: [0, 1.1], direction: 0 }), /location \[x, y\] must both be integers/)
    })
  })
  describe('#rotate', () => {
    let rover
    beforeEach(() => {
      rover = new Rover({ location: [0, 0], direction: 0 })
    })
    it('should require a valid direction', () => {
      assert.throws(() => rover.rotate(), /integer direction to rotate is required/)
      assert.throws(() => rover.rotate('left'), /integer direction to rotate is required/)
    })
    it('should only allow turning left or right', () => {
      assert.throws(() => rover.rotate(-2), /direction must be -1 or 1 \(left or right\)/)
    })
    it('should rotate in the specified direction', () => {
      assert.strictEqual(rover.direction, 0)
      rover.rotate(-1)
      assert.strictEqual(rover.direction, 3)
      rover.rotate(-1)
      assert.strictEqual(rover.direction, 2)
      rover.rotate(1)
      assert.strictEqual(rover.direction, 3)
    })
  })
  describe('#move', () => {
    let rover
    beforeEach(() => {
      rover = new Rover({ location: [0, 0], direction: 0 })
    })
    it('should move properly', () => {
      assert.deepStrictEqual(rover.location, [0, 0])
      rover.move() // facing north
      assert.deepStrictEqual(rover.location, [0, 1])
      rover.move() // facing north
      assert.deepStrictEqual(rover.location, [0, 2])
      rover.rotate(1)
      rover.move() // facing east
      assert.deepStrictEqual(rover.location, [1, 2])
    })
    it('should not allow moving into negative coordinates', () => {
      assert.deepStrictEqual(rover.location, [0, 0])
      rover.rotate(-1)
      assert.throws(() => rover.move(), /cannot move into negative coordinates/)
    })
    it('should optionally go in reverse', () => {
      assert.deepStrictEqual(rover.location, [0, 0])
      rover.move() // facing north
      assert.deepStrictEqual(rover.location, [0, 1])
      rover.move({ reverse: true })
      assert.deepStrictEqual(rover.location, [0, 0])
      rover.rotate(1)
      rover.move()
      assert.deepStrictEqual(rover.location, [1, 0])
      rover.move({ reverse: true })
      assert.deepStrictEqual(rover.location, [0, 0])
    })
  })
})
