import { makeRegisterCompany } from "../../use-case/factories/makeRegisterCompany"
import { t } from "elysia"

export const registerCompanyBodySchema = t.Object({
    // user_id: t.String({
    //     examples: ['xxxxx-xxxxx-xxxxx-xxxxx'],
    //     error: 'User id missing'
    // }),
    name: t.String({
        examples: ['Company name'],
        error: 'Company name missing'
    }),
})

interface RegisterCompanyParams {
    store: Object,
    request: Request,
    body: {
        name: string,
    },
    user_id: string | number | null,
}

export async function registerCompany({ body: { name }, user_id }: RegisterCompanyParams) {
    if (!user_id) {
        throw new Error('Bad request')
    }

    const registerUser = makeRegisterCompany()

    const { company, user_company } = await registerUser.execute({
        name,
        user_id: user_id as string
    })

    return {
        company
    }
}