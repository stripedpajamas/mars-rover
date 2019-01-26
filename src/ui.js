const fs = require('fs')
const prompts = require('prompts')
const RoverController = require('./controller')
const util = require('./util')

class UserInterface {
  constructor () {
    this.controller = null
    this.directions = ['N', 'E', 'S', 'W']
  }
  async menu () {}
  async setup () {}
  async run () {}
  async error (e, next) { next() }
  async printResults () {
    if (!this.controller || !this.controller.rovers) return
    console.log('\nResults after running commands:')
    this.controller.rovers.forEach((rover, id) => {
      console.log(`\tRover ${id}: ${rover.location.join(' ')} ${this.directions[rover.direction]}`)
    })
    console.log('')
  }
  async onCancel () { process.exit(0) }
}

class FileInterface extends UserInterface {
  constructor () {
    super()
    this.filePath = null
    this.rovers = null
    this.menu = this.menu.bind(this)
  }
  async menu () {
    const { filePath } = await prompts({
      type: 'text',
      name: 'filePath',
      message: 'Enter path to input file',
      initial: 'sample.txt'
    }, { onCancel: this.onCancel })
    this.filePath = filePath
    try {
      await this.setup()
      await this.run()
      await this.printResults()
    } catch (e) {
      return this.error(e, this.menu)
    }
  }
  async setup () {
    let input = fs.readFileSync(this.filePath, 'utf8')
    if (!input) {
      throw new Error('file empty')
    }
    const { dimensions, rovers } = util.parseFile(input)
    const controller = new RoverController({ dimensions })
    rovers.forEach((rover) => {
      controller.addRover(rover.location, rover.direction)
    })
    this.controller = controller
    this.rovers = rovers
  }
  async run () {
    this.rovers
      .forEach(({ commands }, id) => (
        this.controller.runCommands(id, commands)
      ))
  }
  async error (e, next) {
    const { tryAgain } = await prompts({
      type: 'confirm',
      name: 'tryAgain',
      message: `Error: ${e.message}. Try another file?`,
      initial: true
    }, { onCancel: this.onCancel })
    return tryAgain && next()
  }
}

class ManualInterface extends UserInterface {
  constructor () {
    super()
    this.dimensions = null
    this.menu = this.menu.bind(this)
  }
  async getDimensions () {
    const { height, width } = await prompts([
      {
        type: 'number',
        name: 'height',
        message: 'Enter height of plateau',
        initial: 5
      },
      {
        type: 'number',
        name: 'width',
        message: 'Enter width of plateau',
        initial: 5
      }
    ], { onCancel: this.onCancel })

    this.dimensions = [width, height]
  }
  async addRovers () {
    const { x, y, direction } = await prompts([
      {
        type: 'number',
        name: 'x',
        message: 'Enter initial X position of rover',
        initial: 0
      },
      {
        type: 'number',
        name: 'y',
        message: 'Enter initial Y position of rover',
        initial: 0
      },
      {
        type: 'select',
        name: 'direction',
        message: 'Enter initial direction of rover',
        choices: [
          { title: 'North', value: 0 },
          { title: 'East', value: 1 },
          { title: 'South', value: 2 },
          { title: 'West', value: 3 }
        ]
      }
    ], { onCancel: this.onCancel })
    this.controller.addRover([x, y], direction)
  }
  async removeRovers () {
    const { value } = await prompts({
      type: 'select',
      message: 'Select ID of rover to remove',
      choices: this.controller.rovers.map((rover, idx) => ({
        title: `ID: ${idx}; Location: ${rover.location}`,
        value: idx
      }))
    }, { onCancel: this.onCancel })
    this.controller.removeRover(value)
  }
  async menu () {
    if (!this.dimensions) {
      try {
        await this.getDimensions()
        await this.setup()
      } catch (e) {
        this.dimensions = null
        this.controller = null
        this.error(e, this.menu)
      }
    }
    const { value } = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose an option',
      choices: [
        { title: 'Add rover', value: 'add' },
        {
          title: 'Remove rover',
          value: 'remove',
          disabled: !this.controller.rovers.length
        },
        {
          title: 'Run commands',
          value: 'run',
          disabled: !this.controller.rovers.length
        },
        { title: 'Cancel', value: 'cancel' }
      ]
    }, { onCancel: this.onCancel })
    switch (value) {
      case 'add': {
        try {
          await this.addRovers()
        } catch (e) { return this.error(e, this.menu) }
        break
      }
      case 'remove': {
        try {
          await this.removeRovers()
        } catch (e) { return this.error(e, this.menu) }
        break
      }
      case 'run': {
        try {
          await this.run()
        } catch (e) { return this.error(e, this.menu) }
        break
      }
      case 'cancel': {
        // back to main menu
        return
      }
      default: {
        return this.menu()
      }
    }
    return this.menu()
  }
  async setup () {
    this.controller = new RoverController({ dimensions: this.dimensions })
  }
  async run () {
    const { id, commandString } = await prompts([
      {
        type: 'select',
        name: 'id',
        message: 'Select ID of rover to set commands',
        choices: this.controller.rovers.map((rover, idx) => ({
          title: `ID: ${idx}; Location: ${rover.location}`,
          value: idx
        }))
      },
      {
        type: 'text',
        name: 'commandString',
        message: 'Type command string',
        initial: 'LMLMLMLMM'
      }
    ], { onCancel: this.onCancel })
    const commands = util.parseCommands(commandString)
    this.controller.runCommands(id, commands)
    this.printResults()
  }
  async error (e, next) {
    const { tryAgain } = await prompts({
      type: 'confirm',
      name: 'tryAgain',
      message: `Error: ${e.message}. Continue manual entry?`,
      initial: true
    }, { onCancel: this.onCancel })
    return tryAgain && next()
  }
}

module.exports = {
  FileInterface,
  ManualInterface
}
