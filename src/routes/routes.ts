import { Elysia, t } from "elysia"
import { generateToken, generateTokenParamsSchema } from "./controllers/generate-token"
import { patchServiceBodySchema, patchServiceRules } from "./controllers/patch-service-rules"
import { registerCompany, registerCompanyBodySchema } from "./controllers/register-company"
import { registerUser, registerUserBodySchema } from "./controllers/register-user"
import { validateToken, validateTokenBodySchema, validateTokenParamsSchema } from "./controllers/validate-token"
import { AuthenticationSchema, CompanySchema, TimesSchema, UserSchema } from "./schemas/elysia-schemas"
import { signIn, signInBodySchema } from "./controllers/sign-in"
import { plugins } from "../plugins"
import { middlewares } from "./middlewares/middlewares"
import { addSchedule, addScheduleBodySchema, addScheduleParamsSchema } from "./controllers/add-schedule"
import { patchSchedule, patchScheduleBodySchema, patchScheduleParamsSchema } from "./controllers/patch-schedule"
import { getSchedule, getScheduleParamsSchema } from "./controllers/get-schedule"
import { deleteSchedule, deleteScheduleParamsSchema } from "./controllers/delete-schedule"
import { getAvailableTimes, getAvailableTimesParamsSchema, getAvailableTimesQuerySchema } from "./controllers/get-available-times"
import { makeAppointment, makeAppointmentBodySchema } from "./controllers/make-appointment"
import { cancelAppointment, cancelAppointmentParamsSchema } from "./controllers/cancel-appointment"

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
        .group('/company', (app) => app
            .post('', ({ request, body, store, user_id }) => registerCompany({
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
            .patch('/:company_id', ({ request, body, params }) => patchServiceRules({
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
            .group('/:company_id/schedule', app => app
                .post('', ({ body, user_id, params }) => addSchedule({
                    body,
                    params,
                    user_id
                }), {
                    detail: {
                        tags: ['Dashboard']
                    },
                    body: addScheduleBodySchema,
                    params: addScheduleParamsSchema,
                })
                .patch('/:schedule_id', ({ body, params }) => patchSchedule({
                    body, params
                }), {
                    detail: {
                        tags: ['Dashboard']
                    },
                    body: patchScheduleBodySchema,
                    params: patchScheduleParamsSchema
                })
                .get('', ({
                    user_id,
                    params
                }) => getSchedule({
                    user_id,
                    params
                }), {
                    detail: {
                        tags: ['Dashboard']
                    },
                    params: getScheduleParamsSchema
                })
                .delete('/:schedule_id', ({
                    params,
                    user_id
                }) => deleteSchedule({
                    params,
                    user_id
                }), {
                    detail: {
                        tags: ['Dashboard']
                    },
                    params: deleteScheduleParamsSchema
                }),
            )
            .get('/:company_id/get-available-times', ({ query, params, user_id }) => getAvailableTimes({
                params,
                query,
                user_id
            }), {
                detail: {
                    tags: ['Dashboard']
                },
                headers: AuthenticationSchema,
                query: getAvailableTimesQuerySchema,
                params: getAvailableTimesParamsSchema,
                response: t.Object({
                    times: TimesSchema
                })
            })
        )

)

const clientRoutes = new Elysia().use(globalPlugins)
    .post('/make-appointment', ({ body }) => makeAppointment({
        body
    }), {
        body: makeAppointmentBodySchema
    })
    .post('/cancel-appointment/:appointment_id', ({ params }) => cancelAppointment({
        params
    }), {
        params: cancelAppointmentParamsSchema
    })

export const routes = new Elysia()
    .use(authenticationRoutes)
    .use(dashboardRoutes)
    .use(clientRoutes)
