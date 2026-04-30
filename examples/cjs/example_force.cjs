const logger = require('../../lib/cjs/index.js')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('*')
logger.setLevel('info')

const log = logger.createLogger('namespace', true)
const num = 1
log.info('Logging information', { action: 'checkNumber', value: num, isPositive: num > 0 })
