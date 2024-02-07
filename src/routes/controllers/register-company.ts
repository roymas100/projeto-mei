import { z } from "zod"
import { makeRegisterCompany } from "../../use-case/factories/makeRegisterCompany"

export async function registerCompany(req: Request): Promise<Response> {

    const schema = z.object({
        name: z.string(),
        user_id: z.string(),
    })

    const { user_id, name } = schema.parse(await req.json())

    const registerUser = makeRegisterCompany()

    const { company, user_company } = await registerUser.execute({
        name,
        user_id
    })

    return new Response(JSON.stringify({ company }))
}