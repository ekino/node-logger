const logger = require('../index')

logger.setNamespaces('namespace:*')
logger.setLevel('debug')
logger.setOutput(logger.outputs.pretty)

const log = logger('namespace:subNamespace')
log.debug('ctxId', 'Will be logged',{someData: 'someValue', someData2: 'someValue'})