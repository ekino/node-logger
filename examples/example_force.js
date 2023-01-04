const logger = require('../lib/index')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('*')
logger.setLevel('info')

const log = logger.createLogger('namespace', true)
const num = 1
log.debug('Will be logged', { someData: 'someValue' }, num > 0)
