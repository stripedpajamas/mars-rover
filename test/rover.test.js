const assert = require('assert')
const Rover = require('../src/rover')

describe('Rover', () => {
  describe('constructor', () => {
    it('should set direction and location', () => {
      let rover = new Rover({ location: [0, 0], direction: 1 })
      assert.deepStrictEqual(rover.location, [0, 0])
      assert.deepStrictEqual(rover.direction, 1)
    })
    it('should require both direction and location', () => {
      assert.throws(() => new Rover({ location: [0, 0] }), 'rover must have location and direction')
      assert.throws(() => new Rover({ direction: 0 }), 'rover must have location and direction')
    })
    it('should require location to be an [x, y] array', () => {
      assert.throws(() => new Rover({ location: [], direction: 0 }), 'location must be an array [x, y]')
      assert.throws(() => new Rover({ location: [0], direction: 0 }), 'location must be an array [x, y]')
    })
    it('should require location to be integers', () => {
      assert.throws(() => new Rover({ location: [0, 1.1], direction: 0 }), 'location [x, y] must both be integers')
    })
  })
  describe('rotate', () => {
    let rover
    beforeEach(() => {
      rover = new Rover({ location: [0, 0], direction: 0 })
    })
    it('should require a valid direction', () => {
      assert.throws(() => rover.rotate(), 'integer direction to rotate is required')
      assert.throws(() => rover.rotate('left'), 'integer direction to rotate is required')
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
  describe('move', () => {
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
      assert.throws(() => rover.move(), 'cannot move into negative coordinates')
    })
  })
})
