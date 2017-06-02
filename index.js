'use strict'
const _ = require('lodash')
const uuid = require('uuid')
const prettyOutput = require('prettyoutput')

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
/************* EXPORTS *************/
/**
 * @typedef {Function} Logger
 * @param {String} namespace
 * @return {Logger}
 */
module.exports = function(namespace) {
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
    internals.namespaces = namespaces
    internals.enabledNamespaces = []
    internals.disabledNamespaces = []

    namespaces = _.split(namespaces || '', /[\s,]+/)

    _.forEach(namespaces, namespace => {
        if (_.isEmpty(namespace)) return true

        namespace = namespace.replace(/\*/g, '.*?')
        if (namespace[0] === '-') {
            internals.disabledNamespaces.push(new RegExp(`^${namespace.substr(1)}$`))
        } else {
            internals.enabledNamespaces.push(new RegExp(`^${namespace}$`))
        }
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

    internals.level = level

    internals.syncLoggers()
}

/**
 * Change output type. Available values are "pretty" or "json". Default is json
 * @param {string} type
 */
module.exports.setOutput = function(type) {
    if (!internals.outputs.includes(type)) {
        throw new Error(`Invalid output: '${type}'`)
    }

    internals.output = type
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

module.exports.internals = internals

/************* INTERNALS *************/
internals.loggers = {}
internals.levels = ['trace', 'debug', 'info', 'warn', 'error']

internals.outputs = ['json', 'pretty']
internals.output = 'json'
internals.level = 'info'
internals.namespaces = ''
internals.enabledNamespaces = []
internals.disabledNamespaces = []
internals.globalContext = {}

/**
 * Used to override error toJSON function to customize output
 * @return {object}
 */
internals.errorToJson = function() {
    const result = {}

    Object.getOwnPropertyNames(this).forEach(function(key) {
        result[key] = this[key]
    }, this)

    return result
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
    const time = new Date().toISOString()
    const output = Object.assign(internals.globalContext, { level, time, namespace, contextId })
    if (message) output.message = message
    if (data) output.data = data
    internals.write(output)
}

/**
 * Write output
 * @param {Object} output
 */
internals.write = function(output) {
    let result = ''
    if (internals.output === 'pretty') {
        const prefix = `${output.message}\n`
        result = `${prefix}${prettyOutput(output, null, 2)}`
    } else if (internals.output === 'json') {
        const backup = Error.prototype.toJSON
        Error.prototype.toJSON = internals.errorToJson
        result = JSON.stringify(output)
        Error.prototype.toJSON = backup
    }
    process.stdout.write(result)
    process.stdout.write('\n')
}

/**
 * True if both namespace and level are enabled.
 * @param {String} namespace
 * @param {String} level
 * @return {Boolean} true if enabled
 */
internals.isEnabled = function(namespace, level) {
    if (_.indexOf(internals.levels, level) < _.indexOf(internals.levels, internals.level)) {
        return false
    }

    let i = 0
    while (i < internals.disabledNamespaces.length) {
        if (internals.disabledNamespaces[i].test(namespace)) {
            return false
        }
        i += 1
    }

    let j = 0
    while (j < internals.enabledNamespaces.length) {
        if (internals.enabledNamespaces[j].test(namespace)) {
            return true
        }
        j += 1
    }

    return false
}

/**
 * A no op function to be used for disabled loggers.
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
    _.forEach(internals.levels, level => {
        if (!internals.isEnabled(namespace, level)) {
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
const namespaces = process.env.LOG
const level = process.env.LOG_LEVEL || 'error'

module.exports.setNamespaces(namespaces)
module.exports.setLevel(level)
