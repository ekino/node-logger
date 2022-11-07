const logger = require('../lib/index')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger.createLogger('root:testing')
log.debug('ctxId', 'log with predefined context ID', {
    foo: 'bar',
})