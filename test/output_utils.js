const test = require('ava')
const { errorToJson, stringify } = require('../src/output_utils.ts')

test('errorToJson should expose error stack through a json stringify', (t) => {
    const e = new Error()
    const parsed = errorToJson(e)
    t.is(parsed.stack, e.stack)
})

test('stringify should work even with circular references', (t) => {
    const obj = {
        a: '1',
        b: '2',
    }
    obj.d = obj

    t.notThrows(() => stringify(obj))
    const value = stringify(obj)
    t.is(value, '{"a":"1","b":"2"}')
})
