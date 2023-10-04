export default {
    require: ['ts-node/register'],
    extensions: ['js', 'ts'],
    files: ['test/**/*.test.{js,ts}'],
    nodeArguments: ['--experimental-specifier-resolution=node', '--loader=ts-node/esm', '--no-warnings'],
    environmentVariables: {
        TS_NODE_FILES: 'true',
        TS_NODE_TRANSPILE_ONLY: 'true',
        TS_NODE_COMPILER_OPTIONS: '{"module":"ESNext"}',
    },
}
