import { z } from "zod"
import { makeGenerateAuthToken } from "../../use-case/factories/makeGenerateAuthToken"

export async function generateToken(req: Request): Promise<Response> {
    const schema = z.object({
        user_id: z.string(),
    })

    const { user_id } = schema.parse(await req.json())

    const registerUser = makeGenerateAuthToken()

    const { user } = await registerUser.execute(user_id)

    return new Response(JSON.stringify({ user }))
}