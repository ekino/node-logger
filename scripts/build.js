#!/usr/bin/env zx
import { $, chalk } from 'zx'

try {
    await `rm -rf lib`
    await $`npx tsc -p tsconfig.lib.json --module nodenext --outDir lib/esm`
    await $`echo '{"type": "module"}' > lib/esm/package.json`

    await $`npx tsc -p tsconfig.lib.json --module commonjs --outDir lib/cjs`
    await $`echo '{"type": "commonjs"}' > lib/cjs/package.json`

    console.log(chalk.green('Compilation successful'))
} catch (error) {
    console.error(chalk.red('Compilation failed:'), chalk.red(error.message))
}

