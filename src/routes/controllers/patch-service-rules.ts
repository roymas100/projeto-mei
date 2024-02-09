import { makePatchServiceRules } from "../../use-case/factories/makePatchServiceRules"
import { t } from "elysia"

export const patchServiceBodySchema = t.Object({
    service_rules: t.Nullable(t.String({
        examples: ['Payment before session!'],
        error: 'Bad request'
    })),
    cancellation_grace_time: t.Optional(t.String({
        examples: ['00:00:00'],
        error: 'Bad request'
    })),
})

interface PatchServiceParams {
    request: Request,
    params: {
        company_id: string,
    }
    body: {
        service_rules?: string | null,
        cancellation_grace_time?: string,
    }
}

export async function patchServiceRules({ body: { cancellation_grace_time, service_rules }, params: { company_id } }: PatchServiceParams) {
    const registerUser = makePatchServiceRules()

    const { company } = await registerUser.execute({
        company_id,
        cancellation_grace_time,
        service_rules
    })

    return {
        company
    }
}