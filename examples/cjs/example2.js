const logger = require('../../lib/cjs/index.js')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger.createLogger('root:testing')
log.debug('example2', 'log with predefined context ID', {
    foo: 'bar',
})