const logger = require('../build/index')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('namespace:*')
logger.setLevel('info')

const log = logger.createLogger('namespace:subNamespace')

log.warn('message', { someData: 'someValue' })
