#!/usr/bin/env zx
import { $, chalk } from 'zx'

console.log(chalk.green('RUN ESM EXAMPLES:'))
await $`for file in examples/esm/*.js; do node "$file"; done`

console.log(chalk.green('RUN CJS EXAMPLES:'))
await $`for file in examples/cjs/*.js; do node "$file"; done`
