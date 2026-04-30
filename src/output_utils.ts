import type { ReplacerFunction } from './definitions.js'

/**
 * Replace circular reference when used with JSON.stringify
 * Usage : JSON.stringify(element, getCircularReplacer())
 */
export const getCircularReplacer = (): ReplacerFunction => {
    const seen = new WeakSet()
    return (_key: string | number, value: unknown): unknown => {
        if (isObject(value)) {
            if (seen.has(value)) return
            seen.add(value)
        }
        return value
    }
}

/**
 * JSON.stringify with support for errors descriptions
 * You should add a try catch around it to avoid error
 * @param {*} log - json object
 * @returns {string} - stringified log or error log if can not stringify
 */
export const stringifyLog = (log: Record<string, unknown>): string => {
    try {
        return JSON.stringify(log)
    } catch {
        return JSON.stringify(log, getCircularReplacer())
    }
}

/**
 * Alias for stringifyLog for backwards compatibility
 */
export const stringify = stringifyLog

export const isObject = (val: unknown): val is Record<string, unknown> =>
    !!val && typeof val === 'object' && !Array.isArray(val)

/**
 * Used to override error toJSON function to customize output
 * @return {object}
 */
export const errorToJson = (obj: unknown): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    Object.getOwnPropertyNames(obj).forEach((key) => {
        result[key] = (obj as Record<string, unknown>)[key]
    }, obj)

    return result
}
