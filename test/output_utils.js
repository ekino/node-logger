const test = require('ava')
const outputUtils = require('../output_utils')

test('errorToJson should expose error stack through a json stringify', t => {
    const backup = Error.prototype.toJSON
    Error.prototype.toJSON = outputUtils.errorToJson
    const e = new Error()
    const result = JSON.stringify(e)
    Error.prototype.toJSON = backup

    const parsed = JSON.parse(result)
    t.is(parsed.stack, e.stack)
})

test('stringify should work even with circular references', t => {
    const obj = {
        a: "1",
        b: "2"
    }
    obj.d = obj

    t.notThrows(() => outputUtils.stringify(obj))
    const value = outputUtils.stringify(obj)
    t.is(value, '{"a":"1","b":"2","d":"[Circular reference]"}')
})