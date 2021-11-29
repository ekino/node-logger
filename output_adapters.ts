import _ from 'lodash'
import colors from 'colors/safe'
const prettyOutput = require('prettyoutput')

import * as outputUtils from './output_utils'
import { LogInstance, Output } from './definitions'

/**
 * Make sure that we get a 2 digit number by beginning with a 0 if length < 2
 * @param {number|string} num
 * @returns {string}
 */
export const twoDigitNumber = (num?: number | string): string => {
    return `${num}`.length < 2 ? `0${num}` : `${num}`
}

/**
 * Format time as "yyyy-mm-dd hh:mm:ss"
 * @param {Date} time
 * @returns {string}
 */
export const prettyTime = (time?: Date): string | undefined => {
    if (!time) return undefined

    const year = twoDigitNumber(time.getFullYear())
    const month = twoDigitNumber(time.getMonth() + 1)
    const day = twoDigitNumber(time.getDate())
    const hours = twoDigitNumber(time.getHours())
    const minutes = twoDigitNumber(time.getMinutes())
    const seconds = twoDigitNumber(time.getSeconds())

    return `${year}-${twoDigitNumber(month)}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Log with pretty output formater in stdout
 * @param {LogInstance} logInstance
 */
export const pretty = (logInstance: LogInstance): void => {
    const time = prettyTime(logInstance.time)

    const levelColorMap = {
        error: 'red',
        warn: 'yellow',
        info: 'blue',
        debug: 'white',
        trace: 'grey',
    }

    // @TODO: to fix the type of colors
    // @ts-ignore
    const levelColor = levelColorMap[logInstance.level] || 'red'

    const infos = `${time} (${logInstance.namespace}) [${logInstance.level}] : `

    const output: Output = {}
    if (!_.isEmpty(logInstance.contextId)) output.contextId = logInstance.contextId
    if (!_.isEmpty(logInstance.meta)) output.meta = logInstance.meta
    if (!_.isEmpty(logInstance.data)) output.data = logInstance.data

    // @TODO: to fix the type of colors
    // @ts-ignore
    const result = `${infos}${colors[levelColor](logInstance.message)}\n${prettyOutput(output, { maxDepth: 6 }, 2)}`

    process.stdout.write(result)
    process.stdout.write('\n')
}

/**
 * Log in json to stdout
 * @param {LogInstance} logInstance
 */
export const json = (logInstance: LogInstance): void => {
    const output = Object.assign({
        level: logInstance.level,
        time: logInstance.time?.toISOString(),
        namespace: logInstance.namespace,
        contextId: logInstance.contextId,
        ...logInstance.meta,
        message: logInstance.message,
        data: logInstance.data,
    })

    const result = outputUtils.stringify(output)

    process.stdout.write(result)
    process.stdout.write('\n')
}
