'use strict'
const _ = require('lodash')
const uuid = require('uuid')

const outputAdapters = require('./output_adapters')
const outputUtils = require('./output_utils')

const internals = {}

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
 * @typedef {object} Log
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
 * @param {Log} log to write
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
module.exports.createLogger = function(namespace) {
    namespace = namespace || ''

    let logger = internals.loggers[namespace]
    if (logger) return logger

    logger = internals.syncLogger({}, namespace)
    internals.loggers[namespace] = logger

    return logger
}

/**
 * Define enabled / disabled namespaces
 * @param {string} namespaces
 */
module.exports.setNamespaces = function(namespaces) {
    exports.namespaces = namespaces
    internals.namespaces = []

    if (_.isEmpty(namespaces)) return internals.syncLoggers()

    namespaces = namespaces.replace(/\s/g, '').split(',')

    namespaces.forEach(namespace => {
        const parsedNamespace = internals.parseNamespace(namespace)
        if (!parsedNamespace) return true

        internals.namespaces.push(parsedNamespace)
    })

    internals.syncLoggers()
}

/**
 * Change log level
 * @param {string} level - one of trace, debug, info, warn, error
 */
module.exports.setLevel = function(level) {
    if (!internals.levels.includes(level)) {
        throw new Error(`Invalid level: '${level}'`)
    }

    // expose level name
    exports.level = level

    // internally store corresponding level index
    internals.level = internals.levels.indexOf(level)

    internals.syncLoggers()
}

/**
 * Set outputs transport to use
 * @param {Array<OutputAdapter>|OutputAdapter} outputs
 */
module.exports.setOutput = module.exports.setOutputs = function(outputs) {
    if (!outputs) outputs = []
    if (!Array.isArray(outputs)) outputs = [outputs]

    outputs.forEach(output => {
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
module.exports.setGlobalContext = function(context) {
    internals.globalContext = context
}

/**
 * @type {function}
 * Return an id that can be used as a contextId
 * @return {string}
 */
module.exports.id = uuid

// Expose raw namespaces config,
// parsed ones are kept in `internals.namespaces`.
module.exports.namespaces = ''

// Expose raw level config,
// index value is kept in the internal code
module.exports.level = undefined

module.exports.outputs = outputAdapters
module.exports.outputUtils = outputUtils

module.exports.internals = internals

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
 * `module.exports.namespaces` contains raw config.
 *
 * @type {Array<NamespaceConfig>}
 */
internals.namespaces = []

internals.globalContext = {}

/**
 * Parse a namespace to extract level, namespace (eg: ns1:subns1=info)
 * @param {string} namespace
 * @return {NamespaceConfig|null}
 */
internals.parseNamespace = function(namespace) {
    const matches = /([^=]*)(=(.*))?/.exec(namespace)
    if (!matches) return null

    let level = null
    if (matches[3]) {
        const idx = _.indexOf(internals.levels, matches[3])
        if (idx < 0) throw new Error(`Level ${matches[3]} is not a valid log level : ${internals.levels}`)
        level = idx
    }

    let pattern = matches[1]
    if (_.isEmpty(pattern)) return null

    pattern = pattern.replace(/\*/g, '.*?')
    const regex = new RegExp(`^${pattern}$`)

    const namespaceConfig = { regex }
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
internals.log = function(namespace, level, contextId, message, data) {
    if (typeof message !== 'string') {
        data = message
        message = contextId
        contextId = null
    }

    contextId = contextId || module.exports.id()
    const time = new Date()
    const log = { level, time, namespace, contextId }
    log.meta = Object.assign({}, internals.globalContext)
    if (message) log.message = message
    if (data) log.data = data
    internals.write(log)
}

/**
 * Write log using output adapter
 * @param {Log} log
 */
internals.write = function(log) {
    internals.outputs.forEach(outputFn => {
        outputFn(log)
    })
}

/**
 * True if both namespace and level are enabled.
 * @param {String} namespace
 * @param {String} level
 * @return {Boolean} true if enabled
 */
internals.isEnabled = function(namespace, level) {
    let nsLevel = internals.level
    let nsMatch = false

    _.forEachRight(internals.namespaces, ns => {
        if (ns.regex.test(namespace)) {
            nsMatch = true
            if (ns.level) {
                nsLevel = ns.level
                return false
            }
        }
    })

    return nsMatch && level >= nsLevel
}

/**
 * A noop function to be used for disabled loggers.
 */
internals.noop = () => {}

/**
 * Remove all properties but levels.
 * Levels contains a function that does nothing if namespace or level is disable.
 * If enabled, calls log function.
 * @param {Logger} logger
 * @param {String} namespace
 * @return {Logger}
 */
internals.syncLogger = function(logger, namespace) {
    _.forOwn(logger, (value, key) => {
        delete logger[key]
    })

    const enabledLevels = {}
    internals.levels.forEach((level, idx) => {
        if (level === 'none') return
        if (!internals.isEnabled(namespace, idx)) {
            enabledLevels[level] = false
            logger[level] = internals.noop
        } else {
            enabledLevels[level] = true
            logger[level] = function(contextId, message, data) {
                internals.log(namespace, level, contextId, message, data)
            }
        }
    })

    logger.isLevelEnabled = level => enabledLevels[level]

    return logger
}

/**
 * Resync all loggers level functions to enable / disable them
 * This should be called when namespaces or levels are updated
 */
internals.syncLoggers = function() {
    _.forOwn(internals.loggers, (logger, namespace) => {
        internals.syncLogger(logger, namespace)
    })
}

/************* INIT *************/
const namespaces = process.env.LOGS || '*'

module.exports.setNamespaces(namespaces)
module.exports.setLevel('warn')
