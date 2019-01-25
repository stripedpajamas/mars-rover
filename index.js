const fs = require('fs')
const prompts = require('prompts')
const RoverController = require('./src/controller')
const util = require('./src/util')

async function fileError (e) {
  const { tryAgain } = await prompts({
    type: 'confirm',
    name: 'tryAgain',
    message: `Error: ${e.message}. Try another file?`,
    initial: true
  }, { onCancel })
  if (tryAgain) {
    return file()
  }
  // go back to main menu
  main()
}

async function file () {
  const { filePath } = await prompts({
    type: 'text',
    name: 'filePath',
    message: 'Enter path to input file',
    initial: 'sample.txt'
  }, { onCancel })

  let input
  try {
    input = fs.readFileSync(filePath, 'utf8')
  } catch (e) {
    return fileError(e)
  }
  if (!input) {
    return fileError(new Error('file empty'))
  }

  try {
    const { dimensions, rovers } = util.parseFile(input)
    const controller = new RoverController({ dimensions })
    rovers.forEach((rover) => {
      controller.addRover(rover.location, rover.direction)
    })
    run(controller, rovers)
    printResults(controller)
  } catch (e) {
    return fileError(e)
  }
  main()
}

async function manualAddRovers (controller) {
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
        { title: 'N', value: 0 },
        { title: 'E', value: 1 },
        { title: 'S', value: 2 },
        { title: 'W', value: 3 }
      ]
    }
  ], { onCancel })

  try {
    controller.addRover([x, y], direction)
  } catch (e) {
    return manualError(e, () => manualMenu(controller))
  }
}

async function manualRemoveRovers (controller) {
  const { value } = await prompts({
    type: 'select',
    message: 'Select ID of rover to remove',
    choices: controller.rovers.map((rover, idx) => ({
      title: `ID: ${idx}; Location: ${rover.location}`,
      value: idx
    }))
  }, { onCancel })
  controller.removeRover(value)
}

async function manualError (e, next) {
  const { tryAgain } = await prompts({
    type: 'confirm',
    name: 'tryAgain',
    message: `Error: ${e.message}. Continue manual entry?`,
    initial: true
  }, { onCancel })
  if (tryAgain) {
    return next()
  }
  // go back to main menu
  main()
}

async function manualRun (controller) {
  const { id, commandString } = await prompts([
    {
      type: 'select',
      name: 'id',
      message: 'Select ID of rover to set commands',
      choices: controller.rovers.map((rover, idx) => ({
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
  ], { onCancel })
  try {
    const commands = util.parseCommands(commandString)
    controller.runCommands(id, commands)
    printResults(controller)
  } catch (e) {
    return manualError(e, () => manualMenu(controller))
  }
}

async function manualDimensions () {
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
  ], { onCancel })

  return [width, height]
}

async function manual () {
  const dimensions = await manualDimensions()
  let controller
  try {
    controller = new RoverController({ dimensions })
  } catch (e) {
    return manualError(e, manual)
  }
  manualMenu(controller)
}

async function manualMenu (controller) {
  const { value } = await prompts({
    type: 'select',
    name: 'value',
    message: 'Choose an option',
    choices: [
      { title: 'Add rover', value: 'add' },
      {
        title: 'Remove rover',
        value: 'remove',
        disabled: !controller.rovers.length
      },
      {
        title: 'Run commands',
        value: 'run',
        disabled: !controller.rovers.length
      },
      { title: 'Cancel', value: 'cancel' }
    ]
  }, { onCancel })
  switch (value) {
    case 'add': {
      await manualAddRovers(controller)
      return manualMenu(controller)
    }
    case 'remove': {
      await manualRemoveRovers(controller)
      return manualMenu(controller)
    }
    case 'run': {
      await manualRun(controller)
      return manualMenu(controller)
    }
    case 'cancel': {
      return main()
    }
    default: {
      return manualMenu(controller)
    }
  }
}

function run (controller, rovers) {
  rovers.forEach(({ commands }, id) => controller.runCommands(id, commands))
}

function printResults (controller) {
  console.log('\nResults after running commands:')
  const directions = ['N', 'E', 'S', 'W']
  controller.rovers.forEach((rover, id) => {
    console.log(`\tRover ${id}: ${rover.location.join(' ')} ${directions[rover.direction]}`)
  })
  console.log('')
}

function onCancel () {
  process.exit(0)
}

async function main () {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message: 'Choose an option',
    choices: [
      { title: 'Read from file', value: 'file' },
      { title: 'Manual entry', value: 'manual' },
      { title: 'Exit', value: 'exit' }
    ]
  })
  if (response.value === 'file') {
    return file()
  } else if (response.value === 'manual') {
    return manual()
  }
  return onCancel()
}

main()
