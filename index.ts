import _ from 'lodash'
import { v4 as uuidv4 } from 'uuid'
import { Internal, Logger, LogLevel, LogInstance, NameSpaceConfig, OutputAdapter } from './definitions'

import * as outputAdapters from './output_adapters'
import * as outputUtils from './output_utils'

export const internals: Internal = {}

/**
 * @typedef {Function} LoggerLogFunction
 * @param {String} [contextId] - a identifier used to group log associated to a seeam task / request
 * @param {String} message - A description
 * @param {Object} [data] - Anything useful to understand the error
 */

/**
 * @typedef {Function} LoggerIsEnabledFunction
 * @param {String} level
 * @returns {Boolean} true if level is enabled
 */

/**
 * @typedef {Object} Logger
 * @property {LoggerLogFunction} trace - Log to trace level
 * @property {LoggerLogFunction} debug - Log to debug level
 * @property {LoggerLogFunction} info  - Log to info level
 * @property {LoggerLogFunction} warn  - Log to warning level
 * @property {LoggerLogFunction} error - Log to error level
 * @property {LoggerIsEnabledFunction} isLoggerEnabled - check if logger is enabled for a level
 */

/**
 * @typedef {object} LogInstance
 * @property {string} level       - log level (debug, info, warn, error)
 * @property {Date} time          - log time
 * @property {string} namespace   - log namespace
 * @property {string} contextId   - contextId
 * @property {object} meta        - Some meta and additional data from globalContext
 * @property {string} message     - log message
 * @property {object} [data]      - Additional data to understand log message
 */

/**
 * @typedef {Function} OutputAdapter
 * @param {LogInstance} logInstance to write
 */

/**
 * @typedef {Object} NamespaceConfig
 * @property {number} [level]
 * @property {RegExp|null} regex
 */

/************* EXPORTS *************/
/**
 * @typedef {Function} createLogger
 * @param {String} [namespace]
 * @return {Logger}
 */
export const createLogger = (namespace?: string): Logger => {
    namespace = namespace || ''

    let logger = internals.loggers?.[namespace]
    if (logger) return logger

    logger = syncLogger({} as Logger, namespace)
    if (internals.loggers) internals.loggers[namespace] = logger

    return logger
}

/**
 * Define enabled / disabled namespaces
 * @param {string} namespace
 */
export const setNamespaces = (namespace: string): void => {
    internals.namespaces = []

    if (_.isEmpty(namespace)) return syncLoggers()

    const splitNamespaces = namespace.replace(/\s/g, '').split(',')

    splitNamespaces.forEach((name) => {
        const parsedNamespace = parseNamespace(name)
        if (!parsedNamespace) return

        internals.namespaces!.push(parsedNamespace)
    })

    syncLoggers()
}

/**
 * Change log level
 * @param {string} level - one of trace, debug, info, warn, error
 */
export const setLevel = (level: LogLevel): void => {
    if (!internals.levels?.includes(level)) {
        throw new Error(`Invalid level: '${level}'`)
    }

    // internally store corresponding level index
    internals.level = internals.levels?.indexOf(level)

    syncLoggers()
}

/**
 * Set outputs transport to use
 * @param {Array<OutputAdapter>|OutputAdapter} outputs
 */
export const setOutput = (outputs?: OutputAdapter[] | OutputAdapter): void => {
    if (!outputs) outputs = []
    if (!Array.isArray(outputs)) outputs = [outputs]

    outputs.forEach((output) => {
        if (!_.isFunction(output)) throw new Error(`Invalid output: '${output}'`)
    })

    internals.outputs = outputs
}

/**
 * Set a global context to append to all logs,
 * useful to append application/service name globally for example.
 * Be warned this context will be added to all logs,
 * even those from third party libraries if they use this module.
 * @param {Object} context - The object holding default context data
 */
export const setGlobalContext = (context: Record<string, unknown>): void => {
    internals.globalContext = context
}

/**
 * @type {function}
 * Return an id that can be used as a contextId
 * @return {string}
 */
export const id = (): string => {
    return uuidv4()
}

/**
 * Parse a namespace to extract level, namespace (eg: ns1:subns1=info)
 * @param {string} namespace
 * @return {NamespaceConfig|null}
 */
export const parseNamespace = (namespace: string): NameSpaceConfig | null => {
    const matches = /([^=]*)(=(.*))?/.exec(namespace)
    if (!matches) return null

    let level
    if (matches[3]) {
        const idx = _.indexOf(internals.levels, matches[3])
        if (idx < 0) throw new Error(`Level ${matches[3]} is not a valid log level : ${internals.levels}`)
        level = idx
    }

    let pattern = matches[1]
    if (!pattern || _.isEmpty(pattern)) return null

    pattern = pattern.replace(/\*/g, '.*?')
    const regex = new RegExp(`^${pattern}$`)

    const namespaceConfig: NameSpaceConfig = { regex }
    if (level) namespaceConfig.level = level

    return namespaceConfig
}

/**
 * Log method. Write to stdout as a JSON object
 * @param {String} namespace
 * @param {String} level
 * @param {String} [contextId]
 * @param {String} message
 * @param {Object} [data] - An object holding data to help understand the error
 */
export const log = (namespace: string, level: LogLevel, contextId?: string | null, message?: string | null, data?: unknown): void => {
    if (typeof message !== 'string') {
        data = message
        message = contextId
        contextId = null
    }

    contextId = contextId || id()
    const time = new Date()
    const logInstance: LogInstance = { level, time, namespace, contextId }
    if (internals.globalContext) logInstance.meta = Object.assign({}, internals.globalContext)
    if (message) logInstance.message = message
    if (data) logInstance.data = data

    write(logInstance)
}

/**
 * Write log using output adapter
 * @param {LogInstance} logInstance
 */
export const write = (logInstance: LogInstance): void => {
    internals.outputs?.forEach((outputFn) => {
        outputFn(logInstance)
    })
}

/**
 * Remove all properties but levels.
 * Levels contains a function that does nothing if namespace or level is disable.
 * If enabled, calls log function.
 * @param {Logger} logger
 * @param {String} namespace
 * @return {Logger}
 */
export const syncLogger = (logger: Logger, namespace: string): Logger => {
    _.forOwn(logger, (value, key: keyof Logger) => {
        delete logger[key]
    })

    const enabledLevels: Record<string, boolean> = {}
    if (internals.levels) {
        internals.levels.forEach((level, idx) => {
            if (level === 'none') return
            if (!internals.isEnabled?.(namespace, idx)) {
                enabledLevels[level] = false
                logger[level] = () => {}
            } else {
                enabledLevels[level] = true
                logger[level] = (contextId: string, message: string, data?: unknown) => {
                    log(namespace, level, contextId, message, data)
                }
            }
        })

        logger.isLevelEnabled = (level) => enabledLevels[level]
    }

    return logger
}

/**
 * Resync all loggers level functions to enable / disable them
 * This should be called when namespaces or levels are updated
 */
export const syncLoggers = () => {
    _.forOwn(internals.loggers, (logger, namespace) => {
        syncLogger(logger, namespace)
    })
}

/************* INTERNALS *************/
internals.loggers = {}
internals.levels = ['trace', 'debug', 'info', 'warn', 'error', 'none']
/**
 * List of output functions
 * @type {Array<OutputAdapter>}
 */
internals.outputs = [outputAdapters.json]

/**
 * Internally we store level index as it's quicker to compare numbers
 */
internals.level = undefined

/**
 * Internally store parsed namespaces,
 * `exports.namespaces` contains raw config.
 *
 * @type {Array<NamespaceConfig>}
 */
internals.namespaces = []

internals.globalContext = {}

/**
 * True if both namespace and level are enabled.
 * @param {String} namespace
 * @param {String} level
 * @return {Boolean} true if enabled
 */
internals.isEnabled = (namespace, level): boolean => {
    let nsLevel = internals.level || 0
    let nsMatch = false

    _.forEachRight(internals.namespaces, (ns) => {
        if (ns.regex?.test(namespace)) {
            nsMatch = true
            if (ns.level) {
                nsLevel = ns.level
                return false
            }
        }
    })

    return nsMatch && level >= nsLevel
}

/************* INIT *************/
const namespaces = process.env.LOGS || '*'
const logLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'warn'

setNamespaces(namespaces)
setLevel(logLevel)

export { outputAdapters as outputs }
export { outputAdapters, outputUtils }
