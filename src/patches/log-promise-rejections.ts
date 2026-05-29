import { getErrorStack } from '@tacet-mod/utils/error'

const ErrorTypeWhitelist = [ReferenceError, TypeError, RangeError]

Promise._m = (promise, err) => {
    if (err)
        setTimeout(
            () => {
                if (!promise._h)
                    nativeLoggingHook(
                        `\u001b[33mUnhandled promise rejection: ${getErrorStack(err)}\u001b[0m`,
                        2,
                    )
            },
            ErrorTypeWhitelist.some(it => err instanceof it) ? 0 : 2000,
        )
}
