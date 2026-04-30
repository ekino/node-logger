const logger = require('../../lib/cjs/index.js')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('*')
logger.setLevel('info')
logger.setGlobalContext({ version: '2.0.0', env: 'dev' })

const log = logger.createLogger('namespace')

log.warn('User login attempt failed', { username: 'johndoe', reason: 'Invalid password' })
