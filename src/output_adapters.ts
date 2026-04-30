import { Writable } from 'node:stream'
import { inspect } from 'node:util'
import { colors } from './colors.js'
import type { Log, LogColor, LogLevel, Output } from './definitions.js'
import { stringifyLog } from './output_utils.js'

type PrettyOptions = {
    maxDepth?: number
}

/**
 * Object mapping log color and log level
 * @param {Record<LogLevel, LogColor>} levelColorMap
 */
const levelColorMap: Record<LogLevel, LogColor> = {
    none: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    debug: 'white',
    trace: 'grey',
}

/**
 * Make sure that we get a 2 digit number by beginning with a 0 if length < 2
 * @param {number|string} num
 * @returns {string}
 */
export const twoDigitNumber = (num?: number | string): string => {
    return num != null ? (`${num}`.length < 2 ? `0${num}` : `${num}`) : ''
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
    const hours = twoDigitNumber(time.getUTCHours())
    const minutes = twoDigitNumber(time.getMinutes())
    const seconds = twoDigitNumber(time.getSeconds())

    return `${year}-${twoDigitNumber(month)}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Log with pretty output formatter in stdout
 * @param {Log} log
 */
export const pretty = (log: Log): void => {
    const time = prettyTime(log.time)
    const defaultLevel = log.level || 'error'

    const levelColor = levelColorMap[defaultLevel]
    const infos = `${time} (${log.namespace}) [${defaultLevel}] : `
    const output: Output = { contextId: log.contextId, meta: log.meta, data: log.data }

    const result = `${infos}${colors[levelColor](log.message || '')}\n${prettyOutput(output, { maxDepth: 6 }, 2)}`

    logStream.write(`${result}\n`)
}

export const prettyOutput = (o: unknown, options: PrettyOptions = {}, indent = 2): string =>
    inspect(o, {
        ...options,
        depth: options.maxDepth ?? 6,
        indent: ' '.repeat(indent),
    } as Parameters<typeof inspect>[1])

/**
 * Log in json to stdout
 * @param {Log} log
 */
export const json = (log: Log): void => {
    const output = Object.assign({
        level: log.level,
        time: log.time?.toISOString(),
        namespace: log.namespace,
        contextId: log.contextId,
        ...log.meta,
        message: log.message,
        data: log.data,
    })

    const result = stringifyLog(output)

    logStream.write(`${result}\n`)
}

export const logStream = new Writable({
    write(chunk, encoding, callback) {
        process.stdout.write(chunk, encoding, callback)
    },
})
