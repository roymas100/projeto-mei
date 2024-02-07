import { z } from "zod"
import { makePatchServiceRules } from "../../use-case/factories/makePatchServiceRules"

export async function patchServiceRules(req: Request): Promise<Response> {

    const schema = z.object({
        company_id: z.string(),
        service_rules: z.string().nullable(),
        cancellation_grace_time: z.string().optional(),
    })

    const { cancellation_grace_time, company_id, service_rules } = schema.parse(await req.json())

    const registerUser = makePatchServiceRules()

    const { company } = await registerUser.execute({
        company_id,
        cancellation_grace_time,
        service_rules
    })

    return new Response(JSON.stringify({ company }))
}