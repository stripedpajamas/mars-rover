/* global describe, it, beforeEach */
const assert = require('assert')
const RoverController = require('../src/controller')
const Rover = require('../src/rover')

describe('RoverController', () => {
  describe('#constructor', () => {
    it('should set dimensions of plateau', () => {
      let controller = new RoverController({ dimensions: [5, 5] })
      assert.deepStrictEqual(controller.dimensions, [5, 5])
    })
    it('should require a config object', () => {
      assert.throws(() => new RoverController(), 'must provide a config to create controller')
    })
    it('should require positive height and width', () => {
      assert.throws(() => new RoverController({ dimensions: [-1, 2] }), 'width and height must be positive')
      assert.throws(() => new RoverController({ dimensions: [1, -2] }), 'width and height must be positive')
    })
  })
  describe('#isValidLocation', () => {
    let controller
    beforeEach(() => {
      controller = new RoverController({ dimensions: [5, 5] })
    })
    it('should only consider arrays of positive integers valid', () => {
      assert.strictEqual(controller.isValidLocation([0, 1]), true)
      assert.strictEqual(controller.isValidLocation([0, -1]), false)
      assert.strictEqual(controller.isValidLocation([0]), false)
      assert.strictEqual(controller.isValidLocation([-1, 0]), false)
    })
    it('should only consider coordinates on the plateau valid', () => {
      assert.strictEqual(controller.isValidLocation([6, 5]), false)
      assert.strictEqual(controller.isValidLocation([5, 5]), true)
    })
  })
  describe('#addRover', () => {
    let controller
    beforeEach(() => {
      controller = new RoverController({ dimensions: [5, 5] })
    })
    it('should add a rover', () => {
      let id = controller.addRover([0, 1], 0)
      assert.strictEqual(controller.rovers.length, 1)
      assert.strictEqual(controller.rovers[id] instanceof Rover, true)
    })
    it('should only add rovers with valid locations', () => {
      assert.throws(() => controller.addRover([-1, 1]), 'invalid initial location for rover')
    })
  })
  describe('#removeRover', () => {
    let controller
    beforeEach(() => {
      controller = new RoverController({ dimensions: [5, 5] })
    })
    it('should remove a rover', () => {
      controller.addRover([0, 0], 0)
      controller.addRover([1, 2], 0)
      assert.strictEqual(controller.rovers.length, 2)
      controller.removeRover(1)
      assert.strictEqual(controller.rovers.length, 1)
    })
    it('should only remove rovers with valid ids', () => {
      assert.throws(() => controller.removeRover(1), 'invalid rover id')
    })
  })
  describe('#runCommands', () => {
    let controller
    beforeEach(() => {
      controller = new RoverController({ dimensions: [5, 5] })
      controller.addRover([0, 0], 0)
      controller.addRover([1, 4], 3)
    })
    it('should not allow invalid rover ids', () => {
      assert.throws(() => controller.runCommands(3, []), 'invalid rover id')
    })
    it('should not allow invalid commands', () => {
      let commands = [
        { command: 'move' },
        { command: 'lift' }
      ]
      assert.throws(() => controller.runCommands(0, commands), 'invalid rover command')
    })
    it('should run the commands on the specified rover', () => {
      let commands = [
        { command: 'rotate', value: 1 },
        { command: 'move' }
      ]
      let { location, direction } = controller.runCommands(0, commands)
      assert.deepStrictEqual(location, [1, 0])
      assert.strictEqual(direction, 1)
    })
    it('should not allow moving off the plateau', () => {
      let commands = [
        { command: 'rotate', value: 1 }, // face north
        { command: 'move' } // get to position [1, 5]
      ]
      let { location, direction } = controller.runCommands(1, commands)
      assert.deepStrictEqual(location, [1, 5])
      assert.strictEqual(direction, 0)
      assert.throws(() => controller.runCommands(1, [{ command: 'move' }]), 'cannot move off plateau')
      assert.deepStrictEqual(location, [1, 5]) // have not moved
    })
  })
})
