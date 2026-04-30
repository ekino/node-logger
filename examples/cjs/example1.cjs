const logger = require('../../lib/cjs/index.js')

logger.setNamespaces('root:*')
logger.setLevel('debug')

const log = logger.createLogger('root:testing')
log.debug('User login attempt', {
    username: 'johndoe',
    timestamp: new Date().toISOString(),
    success: true,
})
