const logger = require('../index')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger('root:testing')
log.debug('ctxId', 'log with predefined context ID', {
    foo: 'bar',
})