/* global describe, it */
const assert = require('assert')
const util = require('../src/util')

describe('utilities', () => {
  describe('parseCommands', () => {
    it('should correctly parse a command string', () => {
      let commandString = 'LMLMLMRMM'
      let commands = util.parseCommands(commandString)
      assert.deepStrictEqual(commands, [
        { command: 'rotate', value: -1 },
        { command: 'move' },
        { command: 'rotate', value: -1 },
        { command: 'move' },
        { command: 'rotate', value: -1 },
        { command: 'move' },
        { command: 'rotate', value: 1 },
        { command: 'move' },
        { command: 'move' }
      ])
    })
    it('should not allow invalid commands in the string', () => {
      assert.throws(() => util.parseCommands('LRX'), 'invalid command string')
    })
    it('should only allow strings as input', () => {
      assert.throws(() => util.parseCommands({}), 'command string must be a string')
    })
  })
  describe('parsePlateau', () => {
    it('should correctly parse a plateau string', () => {
      let plateau = util.parsePlateau('5 5')
      assert.deepStrictEqual(plateau, [5, 5])
    })
    it('should only allow a 2d plateau', () => {
      assert.throws(() => util.parsePlateau('5 4 5'), 'invalid plateau dimensions')
    })
    it('should not allow negative dimensions', () => {
      assert.throws(() => util.parsePlateau('5 -4'), 'invalid plateau dimensions')
    })
    it('should only allow strings as input', () => {
      assert.throws(() => util.parsePlateau({}), 'plateau input must be a string')
    })
  })
  describe('parseRover', () => {
    it('should correctly parse a rover string', () => {
      let { location, direction } = util.parseRover('5 5 N')
      assert.deepStrictEqual(location, [5, 5])
      assert.strictEqual(direction, 0)
    })
    it('should not allow invalid directions', () => {
      assert.throws(() => util.parseRover('1 1 X'))
    })
    it('should only allow strings as input', () => {
      assert.throws(() => util.parseRover({}), 'rover input must be a string')
    })
  })
  describe('parseFile', () => {
    const file = `5 5
1 2 N
LMLMLMLMM
3 3 E
MMRMMRMRRM`
    it('should parse a file into plateau, rovers, and commands', () => {
      const { dimensions, rovers } = util.parseFile(file)
      assert.deepStrictEqual(dimensions, [5, 5])

      assert.deepStrictEqual(rovers[0].location, [1, 2])
      assert.strictEqual(rovers[0].direction, 0)
      assert.strictEqual(rovers[0].commands.length, 9)

      assert.deepStrictEqual(rovers[1].location, [3, 3])
      assert.strictEqual(rovers[1].direction, 1)
      assert.strictEqual(rovers[1].commands.length, 10)
    })
  })
})
