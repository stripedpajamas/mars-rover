/* global describe, it, beforeEach, afterEach */
const fs = require('fs')
const assert = require('assert')
const sinon = require('sinon')
const prompts = require('prompts')
const util = require('../src/util')
const RoverController = require('../src/controller')
const UI = require('../src/ui')

describe('UI', () => {
  describe('UserInterface', () => {
    let user
    beforeEach(() => {
      user = new UI.UserInterface()
    })
    describe('#constructor', () => {
      it('should have a null controller and directions array', () => {
        assert.strictEqual(user.controller, null)
        assert.deepStrictEqual(user.directions, ['N', 'E', 'S', 'W'])
      })
      it('should have empty functions for menu, setup, run', async () => {
        try {
          await user.menu()
          await user.setup()
          await user.run()
        } catch (e) {
          assert.strictEqual(e, undefined)
        }
      })
    })
    describe('#error', () => {
      it('should call next', async () => {
        const next = sinon.stub()
        await user.error(null, next)
        assert.strictEqual(next.called, true)
      })
    })
    describe('#printResults', () => {
      beforeEach(() => {
        sinon.stub(console, 'log')
      })
      afterEach(() => {
        console.log.restore()
      })
      it('should return if no controller or no rovers', async () => {
        await user.printResults()
        assert.strictEqual(console.log.notCalled, true)
      })
      it('should print rover position and direction', async () => {
        user.controller = new RoverController({ dimensions: [5, 5] })
        user.controller.addRover([3, 3], 0)
        await user.printResults()
        assert.strictEqual(console.log.callCount, 3)
      })
    })
    describe('#onCancel', () => {
      beforeEach(() => {
        sinon.stub(process, 'exit')
      })
      afterEach(() => {
        process.exit.restore()
      })
      it('should exit', async () => {
        await user.onCancel()
        assert.strictEqual(process.exit.calledOnce, true)
      })
    })
  })
  describe('FileInterface', () => {
    let file
    beforeEach(() => {
      file = new UI.FileInterface()
    })
    describe('#constructor', () => {
      it('should have filePath, rovers, controller, directions', () => {
        assert.strictEqual(file.filePath, null)
        assert.strictEqual(file.rovers, null)
        assert.strictEqual(file.controller, null)
        assert.deepStrictEqual(file.directions, ['N', 'E', 'S', 'W'])
      })
    })
    describe('#menu', () => {
      beforeEach(() => {
        sinon.stub(file, 'setup')
        sinon.stub(file, 'run')
        sinon.stub(file, 'printResults')
        sinon.stub(file, 'error')
      })
      afterEach(() => {
        file.setup.restore()
        file.run.restore()
        file.printResults.restore()
        file.error.restore()
      })
      it('should get filePath from user and save it as a property', async () => {
        prompts.inject(['sample.txt'])
        await file.menu()
        assert.strictEqual(file.filePath, 'sample.txt')
      })
      it('should call setup, run, printResults', async () => {
        prompts.inject(['sample.txt'])
        await file.menu()
        assert.strictEqual(file.setup.called, true)
        assert.strictEqual(file.run.called, true)
        assert.strictEqual(file.printResults.called, true)
      })
      it('should call error function if anything throws', async () => {
        prompts.inject(['sample.txt'])
        const e = new Error('failure')
        file.setup.throws(e)
        await file.menu()
        assert.strictEqual(file.error.calledWith(e, file.menu), true)
      })
    })
    describe('#setup', () => {
      const fileContents = `5 5
      1 2 N
      LMLMLMLMM
      3 3 E
      MMRMMRMRRM`
      beforeEach(() => {
        sinon.stub(fs, 'readFileSync').returns(fileContents)
        sinon.stub(util, 'parseFile').returns({ dimensions: [0, 0], rovers: [] })
      })
      afterEach(() => {
        fs.readFileSync.restore()
        util.parseFile.restore()
      })
      it('should read the input file', async () => {
        file.filePath = 'sample.txt'
        await file.setup()
        assert.strictEqual(fs.readFileSync.calledWith('sample.txt'), true)
      })
      it('should throw if input is empty', async () => {
        fs.readFileSync.returns('')
        try {
          await file.setup()
        } catch (e) {
          assert.strictEqual(e.message, 'file empty')
        }
      })
      it('should parse the input file', async () => {
        await file.setup()
        assert.strictEqual(util.parseFile.calledWith(fileContents), true)
      })
      it('should create a controller with the dimensions', async () => {
        util.parseFile.returns({
          dimensions: [0, 0],
          rovers: [{ location: [0, 0], direction: 0 }]
        })
        await file.setup()
        assert.deepStrictEqual(file.controller.dimensions, [0, 0])
        assert.deepStrictEqual(file.controller.rovers[0].location, [0, 0])
      })
    })
    describe('#run', () => {
      it('should call runCommands for each rover', async () => {
        file.rovers = [
          { commands: ['LMLMLMLMM'] },
          { commands: ['RMRMRMRMM'] }
        ]
        file.controller = {
          runCommands: sinon.stub()
        }
        await file.run()
        assert.strictEqual(file.controller.runCommands.calledTwice, true)
        assert.strictEqual(file.controller.runCommands.calledWith(0, ['LMLMLMLMM']), true)
        assert.strictEqual(file.controller.runCommands.calledWith(1, ['RMRMRMRMM']), true)
      })
    })
    describe('#error', () => {
      it('should call next if user wants another try', async () => {
        prompts.inject([true])
        const next = sinon.stub()
        await file.error(new Error('test'), next)
        assert.strictEqual(next.called, true)
      })
      it('should not call next if user says no', async () => {
        prompts.inject([false])
        const next = sinon.stub()
        await file.error(new Error('test'), next)
        assert.strictEqual(next.callCount, 0)
      })
    })
  })
  describe('ManualInterface', () => {
    let manual
    beforeEach(() => {
      manual = new UI.ManualInterface()
    })
    describe('#constructor', () => {
      it('should have dimensions, controller, directions', () => {
        assert.strictEqual(manual.dimensions, null)
        assert.strictEqual(manual.controller, null)
        assert.deepStrictEqual(manual.directions, ['N', 'E', 'S', 'W'])
      })
    })
    describe('#getDimensions', () => {
      it('should set dimensions property on class with [width, height]', async () => {
        prompts.inject([5, 4])
        await manual.getDimensions()
        assert.deepStrictEqual(manual.dimensions, [4, 5])
      })
    })
    describe('#addRovers', () => {
      it('should add a rover with initial position and direction', async () => {
        prompts.inject([3, 3, 0])
        manual.controller = new RoverController({ dimensions: [5, 5] })
        await manual.addRovers()
        assert.strictEqual(manual.controller.rovers.length, 1)
        assert.deepStrictEqual(manual.controller.rovers[0].location, [3, 3])
        assert.strictEqual(manual.controller.rovers[0].direction, 0)
      })
    })
    describe('#removeRovers', () => {
      it('should remove a rover from controller', async () => {
        prompts.inject([0])
        manual.controller = new RoverController({ dimensions: [5, 5] })
        manual.controller.addRover([3, 3], 0)
        await manual.removeRovers()
        assert.strictEqual(manual.controller.rovers.length, 0)
      })
    })
    describe('#menu', () => {
      it('should get dimensions and setup if no dimensions are on class', async () => {
        sinon.stub(manual, 'getDimensions').resolves()
        sinon.stub(manual, 'setup').resolves()
        manual.controller = { rovers: [] }
        prompts.inject(['cancel'])
        await manual.menu()
        assert.strictEqual(manual.getDimensions.calledOnce, true)
        assert.strictEqual(manual.setup.calledOnce, true)
      })
      it('should call error function if dimensions/setup fail', async () => {
        sinon.stub(manual, 'getDimensions').resolves()
        sinon.stub(manual, 'setup').rejects()
        sinon.stub(manual, 'error').resolves()
        manual.controller = { rovers: [] }
        await manual.menu()
        assert.strictEqual(manual.error.calledOnce, true)
      })
      it('should call add rover if chosen', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'addRovers').resolves()
        prompts.inject(['add', 'cancel'])
        await manual.menu()
        assert.strictEqual(manual.addRovers.calledOnce, true)
      })
      it('should call error if add rovers fails', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'addRovers').rejects()
        sinon.stub(manual, 'error').resolves()
        prompts.inject(['add'])
        await manual.menu()
        assert.strictEqual(manual.error.calledOnce, true)
      })
      it('should call remove rover if chosen', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'removeRovers').resolves()
        prompts.inject(['remove', 'cancel'])
        await manual.menu()
        assert.strictEqual(manual.removeRovers.calledOnce, true)
      })
      it('should call error if remove rovers fails', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'removeRovers').rejects()
        sinon.stub(manual, 'error').resolves()
        prompts.inject(['remove'])
        await manual.menu()
        assert.strictEqual(manual.error.calledOnce, true)
      })
      it('should call run if chosen', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'run').resolves()
        prompts.inject(['run', 'cancel'])
        await manual.menu()
        assert.strictEqual(manual.run.calledOnce, true)
      })
      it('should call error if run fails', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        sinon.stub(manual, 'run').rejects()
        sinon.stub(manual, 'error').resolves()
        prompts.inject(['run'])
        await manual.menu()
        assert.strictEqual(manual.error.calledOnce, true)
      })
      it('should call itself if invalid option', async () => {
        manual.dimensions = [5, 5]
        manual.controller = new RoverController({ dimensions: [5, 5] })
        prompts.inject(['help', 'cancel'])
        await manual.menu()
      })
    })
    describe('#setup', () => {
      it('should make a new controller with dimensions', async () => {
        manual.dimensions = [5, 5]
        await manual.setup()
        assert.strictEqual(manual.controller instanceof RoverController, true)
        assert.deepStrictEqual(manual.controller.dimensions, [5, 5])
      })
    })
    describe('#run', () => {
      it('should run the commands on the specified rover and print results', async () => {
        prompts.inject([0, 'RM'])
        sinon.stub(manual, 'printResults')
        manual.controller = new RoverController({ dimensions: [5, 5] })
        manual.controller.addRover([1, 4], 3)
        await manual.run()
        assert.strictEqual(manual.controller.rovers[0].direction, 0)
        assert.deepStrictEqual(manual.controller.rovers[0].location, [1, 5])
        assert.strictEqual(manual.printResults.calledOnce, true)
      })
    })
    describe('#error', () => {
      it('should call next if user wants another try', async () => {
        prompts.inject([true])
        const next = sinon.stub()
        await manual.error(new Error('test'), next)
        assert.strictEqual(next.called, true)
      })
      it('should not call next if user says no', async () => {
        prompts.inject([false])
        const next = sinon.stub()
        await manual.error(new Error('test'), next)
        assert.strictEqual(next.callCount, 0)
      })
    })
  })
})
