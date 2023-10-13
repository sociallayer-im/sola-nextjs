import axios from 'axios'

export interface FetchOptions {
    url: string,
    data?: Record<string, string | number | any>
    authToken?: string
    header?: {}
}

async function get (options: FetchOptions) {
    if (options.data && options.authToken ) {
        options.data.auth_tokne = options.authToken
    }

    const before = Date.now()
    const res = await axios.get(options.url, {
        params: options.data
    })
    const after = Date.now()
    const duration = after - before
    console.log(`request time: ${duration}, url: ${options.url}, data: ${JSON.stringify(options.data)}`)
    if (duration > 1000) {
        console.error(`fetch duration: ${duration}, url: ${options.url}, data: ${JSON.stringify(options.data)}`)
    }

    return  res
}

async function post (options: FetchOptions) {
    if (options.data && options.authToken ) {
        options.data.auth_tokne = options.authToken
    }

    const before = Date.now()
    const res = axios.post(options.url, options.data, {
        headers: options.header || {
            'Content-Type': 'application/json'
        }}
    )
    const after = Date.now()
    const duration = after - before
    console.log(`request time: ${duration}, url: ${options.url}, data: ${JSON.stringify(options.data)}`)
    if (duration > 1000) {
        console.error(`fetch duration: ${duration}, url: ${options.url}, data: ${JSON.stringify(options.data)}`)
    }

    return res
}

export default { get, post }
