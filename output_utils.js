const internals = {}
exports.internals = internals

/**
 * Replace circular reference when used with JSON.stringify
 * Usage : JSON.stringify(element, internals.newCircularReplacer())
 */
internals.newCircularReplacer = () => {
    const seen = new WeakSet()
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular reference]'
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
exports.stringify = log => {
    const backup = Error.prototype.toJSON
    Error.prototype.toJSON = internals.errorToJson
    let result = ''
    try {
        result = JSON.stringify(log)
    } catch (e) {
        result = JSON.stringify(log, internals.newCircularReplacer())
    }
    Error.prototype.toJSON = backup

    return result
}

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
