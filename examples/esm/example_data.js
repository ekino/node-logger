import logger from '../../lib/esm/index.js'

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('namespace:*')
logger.setLevel('info')

const log = logger.createLogger('namespace:subNamespace')

log.warn('example5', { someData: 'someValue' })
