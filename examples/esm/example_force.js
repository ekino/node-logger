import logger from '../../lib/esm/index.js'

logger.setOutput(logger.outputs.pretty)
logger.setNamespaces('*')
logger.setLevel('info')

const log = logger.createLogger('namespace', true)
const num = 1
log.debug('example6', { someData: 'someValue' }, num > 0)
