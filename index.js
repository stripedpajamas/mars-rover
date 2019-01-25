const prompts = require('prompts')
const { FileInterface, ManualInterface } = require('./src/ui')

async function main () {
  const file = new FileInterface()
  const manual = new ManualInterface()
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
    await file.menu()
  } else if (response.value === 'manual') {
    await manual.menu()
  } else {
    process.exit(0)
  }
  main()
}

main()
