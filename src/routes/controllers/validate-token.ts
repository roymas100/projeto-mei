import { z } from "zod"
import { makeValidateAuthToken } from "../../use-case/factories/makeValidateAuthToken"

export async function validateToken(req: Request): Promise<Response> {
    const schema = z.object({
        user_id: z.string(),
        token: z.number(),
    })

    const { user_id, token } = schema.parse(await req.json())

    const registerUser = makeValidateAuthToken()

    const { user } = await registerUser.execute({
        token,
        user_id
    })

    return new Response(JSON.stringify({ user }))
}