const formatter = (open: string, close: string) => (input: string) => open + input + close

const createColors = () => ({
    black: formatter('\x1b[30m', '\x1b[39m'),
    blue: formatter('\x1b[34m', '\x1b[39m'),
    brown: formatter('\x1b[38;5;94m', '\x1b[39m'),
    cyan: formatter('\x1b[36m', '\x1b[39m'),
    gray: formatter('\x1b[90m', '\x1b[39m'),
    green: formatter('\x1b[32m', '\x1b[39m'),
    grey: formatter('\x1b[90m', '\x1b[39m'),
    magenta: formatter('\x1b[35m', '\x1b[39m'),
    orange: formatter('\x1b[38;5;208m', '\x1b[39m'),
    pink: formatter('\x1b[38;5;205m', '\x1b[39m'),
    purple: formatter('\x1b[38;5;93m', '\x1b[39m'),
    rainbow: formatter('\x1b[31m', '\x1b[39m'),
    red: formatter('\x1b[31m', '\x1b[39m'),
    reset: formatter('\x1b[0m', '\x1b[0m'),
    white: formatter('\x1b[37m', '\x1b[39m'),
    yellow: formatter('\x1b[33m', '\x1b[39m'),
})

const colors = createColors()

export { colors }
