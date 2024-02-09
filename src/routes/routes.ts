import { Elysia, t } from "elysia"
import { generateToken, generateTokenParamsSchema } from "./controllers/generate-token"
import { patchServiceBodySchema, patchServiceRules } from "./controllers/patch-service-rules"
import { registerCompany, registerCompanyBodySchema } from "./controllers/register-company"
import { registerUser, registerUserBodySchema } from "./controllers/register-user"
import { validateToken, validateTokenBodySchema, validateTokenParamsSchema } from "./controllers/validate-token"
import { CompanySchema, UserSchema } from "./schemas/elysia-schemas"
import { signIn, signInBodySchema } from "./controllers/sign-in"
import { plugins } from "../plugins"
import { middlewares } from "./middlewares/middlewares"

const globalPlugins = new Elysia().use(plugins.pre_render_plugins)

const authenticationRoutes = new Elysia().use(globalPlugins)
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

const dashboardRoutes = new Elysia().use(globalPlugins).guard({}, (app) =>
    app.use(middlewares.verifyTokenPlugin)
        .post('/company', ({ request, body, store, user_id }) => registerCompany({
            body,
            request,
            store,
            user_id
        }), {
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
)

export const routes = new Elysia()
    .use(authenticationRoutes)
    .use(dashboardRoutes)
