/**
 * Replace circular reference when used with JSON.stringify
 * Usage : JSON.stringify(element, getCircularReplacer())
 */

export const getCircularReplacer = (): any => {
    const seen = new WeakSet()
    return (key: string | number, value: any) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return
            }
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
export const stringify = (log: Record<string, unknown>): string => {
    try {
        return JSON.stringify(log)
    } catch (e) {
        return JSON.stringify(log, getCircularReplacer())
    }
}

/**
 * Used to override error toJSON function to customize output
 * @return {object}
 */
export const errorToJson = (obj: any): Record<string, unknown> => {
    const result: Record<string, unknown> = {}

    Object.getOwnPropertyNames(obj).forEach(function (key) {
        result[key] = obj[key]
    }, obj)

    return result
}

export const isObject = (val: unknown): val is Record<string, unknown> => !!val && typeof val === 'object' && !Array.isArray(val)
