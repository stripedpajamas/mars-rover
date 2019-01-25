const fs = require('fs')
const prompts = require('prompts')
const RoverController = require('./controller')
const util = require('./util')

class UserInterface {
  constructor () {
    this.directions = ['N', 'E', 'S', 'W']
  }
  async menu () {}
  async setup () {}
  async run () {}
  async error (e, next) { next() }
  async printResults () {}
  async onCancel () { process.exit(0) }
}

class FileInterface extends UserInterface {
  constructor () {
    super()
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
    let input
    input = fs.readFileSync(this.filePath, 'utf8')
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
  async printResults () {
    console.log('\nResults after running commands:')
    this.controller.rovers.forEach((rover, id) => {
      console.log(`\tRover ${id}: ${rover.location.join(' ')} ${this.directions[rover.direction]}`)
    })
    console.log('')
  }
}

class ManualInterface extends UserInterface {}

module.exports = {
  FileInterface,
  ManualInterface
}
