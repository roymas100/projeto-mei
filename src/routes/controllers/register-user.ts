import { z } from "zod"
import { makeRegisterUser } from "../../use-case/factories/makeRegisterUser"

export async function registerUser(req: Request): Promise<Response> {

    const schema = z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().optional()
    })

    const { email, name, phone } = schema.parse(await req.json())

    const registerUser = makeRegisterUser()

    const { user } = await registerUser.execute({
        name,
        phone,
        email
    })

    return new Response(JSON.stringify({ user }))
}