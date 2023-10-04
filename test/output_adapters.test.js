'use strict'
/* eslint-disable no-shadow */

import test from 'ava'
import sinon from 'sinon'

import * as outputAdapters from '../src/output_adapters.js'
import { createLogger, setLevel, setNamespaces, setOutput } from '../src/index.js'

test.beforeEach(() => {
    setOutput([])
})

test('JSON Output adapter should write a Json Object with expected data and an \\n to stdout if enabled', (t) => {
    const writeStub = sinon.stub(process.stdout, 'write')

    const now = new Date()
    const log = {
        level: 'warn',
        namespace: 'test1',
        time: now,
        contextId: 'ctxId',
        meta: { field1: 'value1' },
        message: 'test',
        data: { someData: 'someValue' },
    }

    outputAdapters.json({ ...log })

    t.true(writeStub.calledTwice)
    const firstCall = writeStub.firstCall.args[0]
    const secondCall = writeStub.secondCall.args[0]
    const parsedObject = JSON.parse(firstCall)

    t.is(parsedObject.namespace, log.namespace)
    t.is(parsedObject.level, log.level)
    t.is(parsedObject.time, log.time.toISOString())
    t.is(parsedObject.contextId, log.contextId)
    t.is(parsedObject.field1, log.meta.field1)
    t.is(parsedObject.message, log.message)
    t.deepEqual(parsedObject.data, log.data)
    t.is(secondCall, '\n')

    writeStub.restore()
})

test('JSON Output Adpater should work if used by logger', (t) => {
    const writeStub = sinon.stub(process.stdout, 'write')

    const now = new Date()
    setNamespaces('test:*')
    setLevel('info')
    setOutput(outputAdapters.json)

    const timersStub = sinon.useFakeTimers(now.getTime())

    const log = createLogger('test:subTest')
    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(writeStub.calledTwice)

    const firstCall = writeStub.firstCall.args[0]
    const secondCall = writeStub.secondCall.args[0]
    const parsedObject = JSON.parse(firstCall)

    t.is(parsedObject.namespace, 'test:subTest')
    t.is(parsedObject.level, 'warn')
    t.is(parsedObject.time, now.toISOString())
    t.is(parsedObject.contextId, 'ctxId')
    t.is(parsedObject.message, 'test')
    t.deepEqual(parsedObject.data, { someData: 'someValue' })
    t.is(secondCall, '\n')

    timersStub.restore()
    writeStub.restore()
})

test('pretty output adapter should write yaml like data and an \\n to stdout if enabled', (t) => {
    const writeStub = sinon.stub(process.stdout, 'write')

    const log = {
        level: 'warn',
        namespace: 'test1',
        time: new Date(1547205226232),
        contextId: 'ctxId',
        meta: { field1: 'value1' },
        message: 'test',
        data: { someData: 'someValue' },
    }

    outputAdapters.pretty({ ...log })

    t.true(writeStub.calledTwice)

    const firstCall = writeStub.firstCall.args[0]
    const secondCall = writeStub.secondCall.args[0]

    let expected = `${outputAdapters.prettyTime(log.time)} (test1) [warn] : \u001b[33mtest\u001b[39m\n`
    expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
    expected += '\u001b[32m  meta: \u001b[39m\n'
    expected += '\u001b[32m    field1: \u001b[39mvalue1\n'
    expected += '\u001b[32m  data: \u001b[39m\n'
    expected += '\u001b[32m    someData: \u001b[39msomeValue\n'

    //@TODO: compare string with color of ava is not working with github actions, to fix this
    if (!process.env.CI) t.is(firstCall, expected)
    t.is(secondCall, '\n')

    writeStub.restore()
})

test('pretty output adapter should work if used by logger', (t) => {
    const writeStub = sinon.stub(process.stdout, 'write')
    const timersStub = sinon.useFakeTimers(1547205226232)

    setNamespaces('test:*')
    setLevel('info')
    setOutput(outputAdapters.pretty)

    const log = createLogger('test:subTest')
    log.warn('ctxId', 'test', { someData: 'someValue' })

    t.true(writeStub.calledTwice)

    const firstCall = writeStub.firstCall.args[0]
    const secondCall = writeStub.secondCall.args[0]

    let expected = `${outputAdapters.prettyTime(new Date(1547205226232))} (test:subTest) [warn] : \u001b[33mtest\u001b[39m\n`
    expected += '\u001b[32m  contextId: \u001b[39mctxId\n'
    expected += '\u001b[32m  meta: \u001b[39m\n'
    expected += '\u001b[32m  data: \u001b[39m\n'
    expected += '\u001b[32m    someData: \u001b[39msomeValue\n'

    //@TODO: compare string with color of ava is not working with github actions, to fix this
    if (!process.env.CI) t.is(firstCall, expected)
    t.is(secondCall, '\n')

    timersStub.restore()
    writeStub.restore()
})
