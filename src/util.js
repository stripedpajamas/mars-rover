/**
 *Parses a plateau string into a [width, height] array
 *
 * @param {string} str the input string of the form '5 4' for 5x4
 * @returns {array} the plateau dimensions [width, height]
 */
function parsePlateau (str) {
  if (typeof str !== 'string') {
    throw new Error('plateau input must be a string')
  }
  const plateau = str.split(' ').map(Number)
  if (plateau.length !== 2 || plateau.some(n => n < 0)) {
    throw new Error('invalid plateau dimensions')
  }
  return plateau
}
/**
 *Parses a rover string into its initial location and direction
 *
 * @param {string} str the input string of the form '1 2 N'
 * @returns {object} the location and direction of the rover
 */
function parseRover (str) {
  if (typeof str !== 'string') {
    throw new Error('rover input must be a string')
  }
  const [x, y, directionString] = str.split(' ')
  const location = [x, y].map(Number)
  const directions = { 'N': 0, 'E': 1, 'S': 2, 'W': 3 }
  const direction = directions[directionString]
  if (typeof direction === 'undefined') {
    throw new Error('invalid direction in rover string')
  }
  return { location, direction }
}

/**
 *Parses a command string into an array of well-formed commands
 *
 * @param {string} str the input string in the form 'LMLMLMLMM'
 * @returns {array} an array of command objects consumable by a rover controller
 */
function parseCommands (str) {
  if (typeof str !== 'string') {
    throw new Error('command string must be a string')
  }
  return str.split('').map(x => {
    switch (x) {
      case 'L':
        return { command: 'rotate', value: -1 }
      case 'R':
        return { command: 'rotate', value: 1 }
      case 'M':
        return { command: 'move' }
      default:
        throw new Error('invalid command string')
    }
  })
}

/**
 *Parses an input file into dimensions, rovers, and commands
 *
 * @param {string} input the full file contents where the first line is dimensions
 * @returns {object} dimensions of plateau and an array of rovers
 */
function parseFile (input) {
  const lines = input.trim().split('\n')
  // first line is plateau dimensions
  const dimensions = parsePlateau(lines.shift())
  // all remaining pairs of lines are rover+command
  const rovers = []
  for (let i = 1; i < lines.length; i += 2) {
    const { location, direction } = parseRover(lines[i - 1])
    rovers.push({
      location,
      direction,
      commands: parseCommands(lines[i])
    })
  }
  return {
    dimensions,
    rovers
  }
}

module.exports = {
  parsePlateau,
  parseRover,
  parseCommands,
  parseFile
}
