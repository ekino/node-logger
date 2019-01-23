const logger = require('../index')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger('root:testing')
log.debug('sample message', {
    foo: 'bar',
})