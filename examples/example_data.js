const logger = require('../index')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('namespace:*')
logger.setLevel('info')

const log = logger('namespace:subNamespace')

log.warn('message', { someData: 'someValue' })