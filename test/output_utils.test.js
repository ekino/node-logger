import test from 'ava'
import { errorToJson, stringify } from '../src/output_utils.js'

test('errorToJson should expose error stack through a json stringify', (t) => {
    const e = { message: 'error', stack: 'strace' }
    const parsed = errorToJson(e)
    t.is(parsed.stack, e.stack)
})

test('stringify should work even with circular references', (t) => {
    const obj = {
        a: '1',
        b: '2',
        d: undefined,
    }
    obj.d = obj

    t.notThrows(() => stringify(obj))
    const value = stringify(obj)
    t.is(value, '{"a":"1","b":"2"}')
})
