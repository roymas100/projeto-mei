import { endOfDay, format, startOfDay } from "date-fns";
import { t } from "elysia";

export const AuthenticationSchema = t.Object({
    'WWW-Authenticate': t.String({
        examples: ['Bearer xxx'],
    })
})

export const UserSchema = t.Object({
    id: t.String(t.Any()),
    name: t.String(t.Any()),
    phone: t.String(t.Any()),
    email: t.Optional(t.Nullable(t.String(t.Any()))),
    created_at: t.Date(t.Any()),
    updated_at: t.Date(t.Any()),
    has_confirmed_phone: t.Any(t.Boolean()),
    token_expiration: t.Nullable(t.Date(t.Any())),
})

export const CompanySchema = t.Object({
    id: t.String(t.Any()),
    name: t.String(t.Any()),
    created_at: t.Date(t.Any()),
    updated_at: t.Date(t.Any()),
    service_rules: t.Nullable(t.String(t.Any())),
    cancellation_grace_time: t.String(t.Any()),
})

export const TimesSchema =
    t.Array(
        t.Object({
            start: t.Date(t.Any({
                examples: [startOfDay(new Date())],
            })),
            end: t.Date(t.Any({
                examples: [endOfDay(new Date())],
            })),
        })
    )
