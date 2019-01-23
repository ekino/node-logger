const logger = require('../index')

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('*')
logger.setLevel('info')
logger.setGlobalContext({ version: '2.0.0', env: 'dev' })

const log = logger('namespace')

log.warn('message', { someData: 'someValue' })