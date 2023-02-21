import { Request } from 'express'
export default function proxyReqOptDecorator(proxyReqOpts: any, srcReq: Request) {
    proxyReqOpts.headers = { ...srcReq.headers, 'Content-Type': 'application/json' }
    return proxyReqOpts
} 