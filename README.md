# @ekino/logger

[![NPM version][npm-image]][npm-url]
[![Travis CI][travis-image]][travis-url]
[![Coverage Status][coverage-image]][coverage-url]
[![styled with prettier][prettier-image]][prettier-url]

A Lightweight logger that combines debug namespacing capabilities with winston levels and multioutput

- [@ekino/logger](#ekinologger)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using context ID](#using-context-id)
    - [Using namespaces](#using-namespaces)
      - [Using Logging Namespaces](#using-logging-namespaces)
    - [Outputs](#outputs)
      - [JSON](#json)
      - [Pretty](#pretty)
      - [Output function](#output-function)
      - [JSON Stringify utility](#json-stringify-utility)
    - [Log data](#log-data)
      - [Adding global metadata](#adding-global-metadata)
  - [TypeScript](#typescript)

## Installation

Using npm:

``` sh
npm install @ekino/logger
```

Or yarn:

``` sh
yarn add @ekino/logger
```

## Usage

By default, the logger output warn and error levels for all namespaces.
You can set LOG_LEVEL environment to override the default behavior.
By default, it writes logs to stdout in JSON format

The logger api allows you to set log level for all namespaces. For advanced usage, you define it even per namespace.

A log instance is bounded to a namespace. To use it, instantiate a logger with a namespace and call a log function.

This logger define 5 log levels: error, warn, info, debug, trace.
When you set a level, all levels above it are enabled too.
Log level can be set by calling `setLevel` function. 

For example, enabling `info` will enable `info`, `warn` and `error` but not `debug` or `trace`.
The "special" log level `none` means no log and can only be used to set a namespace level.

``` js
{ trace: 0, debug: 1, info: 2, warn: 3, error: 4 }
```

The basic log function signature is:

```js
my_log.the_level(message, data) // With data an object holding informations usefull for debug purpose
```

Example

```js
const { setNamespaces, setLevel, createLogger } = require('@ekino/logger')

setNamespaces('root:*')
setLevel('debug')

const logger = createLogger('root:testing')
logger.debug('sample message', {
    foo: 'bar',
})
```

output: 

![Example](docs/images/example_usage1.gif)

### Using context ID

One of the main complexity working with node is ability to follow all logs attached to one call or one function.
This is not mandatory, but based on our experience, we recommend as a best practice to add a unique identifier that will be passed all along functions calls.
When you log something, you can provide this id as a first parameter and logger will log it. If not provided, it's auto generated.

The signature of the function with contextId is: 

```js
my_log.the_level(contextId, message, data)
```

Example app.js

``` javascript
const { setNamespaces, setLevel, createLogger } = require('@ekino/logger')

setNamespaces('root:*')
setLevel('debug')

const logger = createLogger('root:testing')
logger.debug('ctxId', 'log with predefined context ID', {
    foo: 'bar',
})
```

output: 

![Example](docs/images/example_usage2.gif)

### Using namespaces

Logger relies on namespaces. When you want to log something, you should define a namespace that is bound to it.
When you debug, this gives you the flexibility to enable only the namespaces you need to output.
As a good practice, we recommend setting a namespace by folder / file. 
For example for a file in modules/login/dao you could define 'modules:login:dao'.
Warning, "=" can't be part of the namespace as it's a reserved symbol.

You can also define a level per namespace. If no level is defined, the default global level is used.
To disable logs of a namespace, you can specify a level `none`
A namespace ':*' means eveything after ':' will be enabled. Namespaces are parsed as regexp.

To define namespace level, you should suffix namespace with "=the_level" 
For example let's say you need to enable all info logs but for debug purpose you need to lower the level 
of the namespace database to `debug`. You could then use: 

```js
const { setLevel, setNamespaces } = require('@ekino/logger')

setLevel('info')
setNamespaces('*,database*=debug,database:redis*=none')
```

#### Using Logging Namespaces

```js
const { setNamespaces, setLevel, createLogger } = require('@ekino/logger')

setNamespaces('namespace:*, namespace:mute=none')
setLevel('debug')

const loggerA = createLogger('namespace:subNamespace')
const loggerB = createLogger('namespace:mute')

loggerA.debug('Will be logged')
loggerB.info('Will not be logged')
```

```js
const { setNamespaces, setLevel, createLogger } = require('@ekino/logger')

setNamespaces('*, wrongNamespace=none')
setLevel('debug')

const loggerA = createLogger('namespace:subNamespace')
const loggerB = createLogger('wrongNamespace')

loggerA.debug('Will be logged')
loggerB.info('Will not be logged')
```

### Outputs

Logger allow you to provide your own output adapter to customize how and where to write logs.
It's bundle by default with `pretty` adapter and `json` that both write to stdout.
By default, json adapter is enabled.
You can use multiple adapters at the same time

#### JSON

```js
const { setNamespaces, setLevel, setOutput, outputs, createLogger } = require('@ekino/logger')

setNamespaces('namespace:*')
setLevel('debug')
setOutput(outputs.json)

const logger = createLogger('namespace:subNamespace')
logger.debug('ctxId', 'Will be logged', {
    someData: 'someValue',
    someData2: 'someValue'
})
```

output: 

![Example](docs/images/example_usage3.gif)

#### Pretty

Pretty will output a yaml like content.

```js
const { setNamespaces, setLevel, setOutput, outputs, createLogger } = require('@ekino/logger')
    
setNamespaces('namespace:*')
setLevel('debug')
setOutput(outputs.pretty)

const logger = createLogger('namespace:subNamespace')
logger.debug('ctxId', 'Will be logged', {
    someData: 'someValue',
    someData2: 'someValue'
})
```

output: 

![Example](docs/images/example_pretty.gif)

#### Output function

An output, is a function that will receive log data and should transform and store it

Log data follow the format: 

```
{
    time: Date,
    level: string,
    namespace: string,
    contextId: string,
    meta: { any data defined in global context },
    message: string,
    data: object
}
```

```js
const { setNamespaces, setLevel, setOutput, outputs, outputUtils, createLogger } = require('@ekino/logger')
    
setNamespaces('namespace:*')
setLevel('debug')

const consoleAdapter = (log) => {
    console.log(outputUtils.stringify(log))
}

// This will output in stdout with the pretty output 
// and in the same will log through native console.log() function (usually to stdout too)
setOutput([outputs.pretty, consoleAdapter])

const logger = createLogger('namespace:subNamespace')
logger.debug('ctxId', 'Will be logged', {
    someData: 'someValue',
    someData2: 'someValue'
})
```

#### JSON Stringify utility

To ease the creation of an output adapter, we provide a utility to stringify a json object that support circular reference
and add stack to output for errors.

```js
const { outputUtils } = require('@ekino/logger')

const consoleAdapter = (log) => {
    console.log(outputUtils.stringify(log))
}
```

### Log data

Most of the time, a log message is not enough to guess context.
You can append arbitrary data to your logs. 
If you're using some kind of log collector, you'll then be able to extract those values and inject them in elasticsearch for example.

```js
const { setOutput, setNamespaces, setLevel, createLogger } = require('@ekino/logger')
    
setOutput('pretty')
setNamespaces('namespace:*')
setLevel('info')

const logger = createLogger('namespace:subNamespace')
logger.warn('message', { someData: 'someValue' })
```

output: 

![Example](docs/images/example_data.gif)

#### Adding global metadata

Sometimes, you need to identify to which version or which application the logs refers to.
To do so, we provide a function to set informations that will be added to the each log at a top level key.

```js
const { setOutput, setNamespaces, setLevel, setGlobalContext, createLogger } = require('@ekino/logger')

setOutput('pretty')
setNamespaces('*')
setLevel('info')
setGlobalContext({ version: '2.0.0', env: 'dev' })

const logger = createLogger('namespace')
logger.warn('message', { someData: 'someValue' })
```

output: 

![Example](docs/images/example_context.gif)

## TypeScript

This package provides its own definition, so it can be easily used with TypeScript.

[npm-image]: https://img.shields.io/npm/v/@ekino/logger.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@ekino/logger
[travis-image]: https://img.shields.io/travis/ekino/node-logger.svg?style=flat-square
[travis-url]: https://travis-ci.org/ekino/node-logger
[prettier-image]: https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square
[prettier-url]: https://github.com/prettier/prettier
[coverage-image]: https://img.shields.io/coveralls/ekino/node-logger/master.svg?style=flat-square
[coverage-url]: https://coveralls.io/github/ekino/node-logger?branch=master
