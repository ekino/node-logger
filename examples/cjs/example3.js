const logger = require('../../lib/cjs/index.js')

logger.setNamespaces('namespace:*')
logger.setLevel('debug')
//logger.setOutput(logger.outputs.json)

const log = logger.createLogger('namespace:subNamespace')
log.debug('example3', 'Will be logged', { someData: 'someValue', someData2: 'someValue' })
