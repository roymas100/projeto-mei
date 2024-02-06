import { registerUser } from "./controllers/register-user"

export default function routes(req: Request) {
    const url = new URL(req.url)

    if (req.method === 'POST' && url.pathname === '/register-user') {
        return registerUser(req)
    }

    return new Response('Route not found', {
        status: 404
    })

    // switch (url.pathname) {
    //     case '/register-user': return registerUser(req)

    //     default: return new Response('Route not found', {
    //         status: 404
    //     })
    // }
}