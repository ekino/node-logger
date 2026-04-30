const logger = require('../../lib/cjs/index.js')

logger.setNamespaces('namespace:*')
logger.setLevel('debug')
logger.setOutput(logger.outputs.pretty)

const log = logger.createLogger('namespace:subNamespace')
log.debug('ctxId', 'User login attempt', {
    username: 'johndoe',
    ipAddress: '192.168.1.1',
    timestamp: new Date().toISOString(),
})
