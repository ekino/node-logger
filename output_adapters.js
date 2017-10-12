'use strict'
const _ = require('lodash')
const prettyOutput = require('prettyoutput')
const colors = require('colors/safe')

const outputUtils = require('./output_utils')

const internals = {}
exports.internals = internals

/**
 * Make sure that we get a 2 digit number by beginning with a 0 if length < 2
 * @param {number|string} number
 * @returns {string}
 */
internals.twoDigitNumber = number => {
    return `${number}`.length < 2 ? `0${number}` : `${number}`
}

/**
 * Format time as "yyyy-mm-dd hh:mm:ss"
 * @param {Date} time
 * @returns {string}
 */
internals.prettyTime = time => {
    const year = internals.twoDigitNumber(time.getFullYear())
    const month = internals.twoDigitNumber(time.getMonth() + 1)
    const day = internals.twoDigitNumber(time.getDate())
    const hours = internals.twoDigitNumber(time.getHours())
    const minutes = internals.twoDigitNumber(time.getMinutes())
    const seconds = internals.twoDigitNumber(time.getSeconds())

    return `${year}-${internals.twoDigitNumber(month)}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Log with pretty output formater in stdout
 * @param {Log} log
 */
exports.pretty = log => {
    const time = internals.prettyTime(log.time)

    const levelColorMap = {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'white',
        trace: 'grey'
    }
    const levelColor = levelColorMap[log.level] || 'red'

    const infos = `${time} (${log.namespace}) [${log.level}] : `

    const output = {}
    if (!_.isEmpty(log.contextId)) output.contextId = log.contextId
    if (!_.isEmpty(log.meta)) output.meta = log.meta
    if (!_.isEmpty(log.data)) output.data = log.data

    const result = `${infos}${colors[levelColor](log.message)}\n${prettyOutput(output, { maxDepth: 6 }, 2)}`

    process.stdout.write(result)
    process.stdout.write('\n')
}

/**
 * Log in json to stdout
 * @param {Log} log
 */
exports.json = log => {
    const output = Object.assign({
        level: log.level,
        time: log.time.toISOString(),
        namespace: log.namespace,
        contextId: log.contextId,
        ...log.meta,
        message: log.message,
        data: log.data
    })

    const result = outputUtils.stringify(output)

    process.stdout.write(result)
    process.stdout.write('\n')
}
