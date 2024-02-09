import { t } from "elysia"
import { generateToken, generateTokenParamsSchema } from "./controllers/generate-token"
import { patchServiceBodySchema, patchServiceRules } from "./controllers/patch-service-rules"
import { registerCompany, registerCompanyBodySchema } from "./controllers/register-company"
import { registerUser, registerUserBodySchema } from "./controllers/register-user"
import { validateToken, validateTokenBodySchema, validateTokenParamsSchema } from "./controllers/validate-token"
import { CompanySchema, UserSchema } from "./schemas/elysia-schemas"
import { signIn, signInBodySchema } from "./controllers/sign-in"
import { app } from "../app"

const authenticationRoutesApp = app
    .post('/sign-up', ({ request, body }) => registerUser({ request, body }), {
        body: registerUserBodySchema,
        detail: {
            tags: ['Authentication']
        },
        response: t.Object({
            user: UserSchema,
        })
    })
    .post('/sign-in', ({ request, body }) => signIn({ request, body }), {
        afterHandle: async ({ response, set, jwt, cookie: { auth } }) => {
            const token = await jwt.sign({
                user_id: response.user.id as any
            })

            auth.set({
                value: token
            })

            response.token = token
        },
        body: signInBodySchema,
        detail: {
            tags: ['Authentication']
        },
        response: t.Object({
            user: UserSchema,
            token: t.Nullable(t.String())
        })
    })
    .post('/generate-token/:user_id', ({ request, params }) => generateToken({
        request,
        params
    }), {
        detail: {
            tags: ['Authentication']
        },
        params: generateTokenParamsSchema,
        response: {
            200: t.Object({
                user: UserSchema
            }),
        }
    })
    .post('/validate-token/:user_id', ({ request, params, body }) => validateToken({
        request, body,
        params
    }), {
        afterHandle: async ({ response, set, jwt, cookie: { auth } }) => {
            const token = await jwt.sign({
                user_id: response.user.id as any
            })

            auth.set({
                value: token
            })

            response.token = token
        },
        detail: {
            tags: ['Authentication']
        },
        params: validateTokenParamsSchema,
        body: validateTokenBodySchema,
        response: t.Object({
            user: UserSchema,
            token: t.Nullable(t.String())
        })
    })

const dashboardRoutesApp = authenticationRoutesApp
    .derive(async ({ set, jwt, bearer }) => {
        const payload = await jwt.verify(bearer)

        return {
            user_id: payload ? payload.user_id : null,
            isAuthenticated: !!payload
        }
    })

export const server = dashboardRoutesApp
    .post('/company', ({ request, body, store, user_id }) => registerCompany({
        body,
        request,
        store,
        user_id
    }), {
        beforeHandle: async ({ set, isAuthenticated }) => {
            if (!isAuthenticated) {
                set.status = 401
                set.headers[
                    'WWW-Authenticate'
                ] = `Bearer realm='sign', error="invalid_request"`

                return new Response('Unauthorized', {
                    status: 401
                })
            }
        },
        detail: {
            tags: ['Dashboard']
        },
        body: registerCompanyBodySchema,
        response: {
            200: t.Object({
                company: CompanySchema
            }),
            401: t.String()
        }
    })
    .patch('/company/:company_id', ({ request, body, params }) => patchServiceRules({
        body,
        request,
        params,
    }), {
        beforeHandle: async ({ isAuthenticated, set }) => {
            if (!isAuthenticated) {
                set.status = 401
                set.headers[
                    'WWW-Authenticate'
                ] = `Bearer realm='sign', error="invalid_request"`

                return new Response('Unauthorized', {
                    status: 401
                })
            }
        },
        detail: {
            tags: ['Dashboard']
        },
        body: patchServiceBodySchema,
        response: {
            200: t.Object({
                company: CompanySchema
            }),
            401: t.String()
        }
    })