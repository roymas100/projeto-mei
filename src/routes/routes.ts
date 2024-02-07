import { generateToken } from "./controllers/generate-token"
import { patchServiceRules } from "./controllers/patch-service-rules"
import { registerCompany } from "./controllers/register-company"
import { registerUser } from "./controllers/register-user"
import { validateToken } from "./controllers/validate-token"

export default function routes(req: Request) {
    const url = new URL(req.url)

    if (req.method === 'POST') {
        switch (url.pathname) {
            case '/register-user': return registerUser(req)
            case '/generate-token': return generateToken(req)
            case '/validate-token': return validateToken(req)
            case '/register-company': return registerCompany(req)
            case '/patch-service-rules': return patchServiceRules(req)
        }
    }

    return new Response('Route not found', {
        status: 404
    })
}