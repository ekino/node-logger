import logger from '../../lib/esm/index.js'

logger.setNamespaces('namespace:*')
logger.setLevel('debug')
logger.setOutput(logger.outputs.pretty)

const log = logger.createLogger('namespace:subNamespace')
log.debug('example7', 'Will be logged', { someData: 'someValue', someData2: 'someValue' })
