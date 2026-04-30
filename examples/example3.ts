import * as logger from '../src/index.js'

logger.setNamespaces('namespace:*')
logger.setLevel('debug')

const log = logger.createLogger('namespace:subNamespace')
log.debug('ctxId', 'User login attempt', {
    username: 'johndoe',
    loginTime: new Date().toISOString(),
})
