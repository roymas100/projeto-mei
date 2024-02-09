import bearer from "@elysiajs/bearer";
import cors from "@elysiajs/cors";
import jwt from "@elysiajs/jwt";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const app = new Elysia()
    .use(cors({
        // origin:  /.*\.saltyaom\.com$/
    }))
    .use(bearer())
    .use(jwt({
        name: 'jwt',
        secret: 'Segredo',
        exp: '7d'
    }))
    .use(swagger({
        path: '/swagger',
        documentation: {
            info: {
                title: 'MEI Project API',
                version: '0.1'
            },
            tags: [
                { name: 'Authentication', description: 'Authentication endpoints' },
                { name: 'Dashboard', description: 'Dashboard endpoints' },
                { name: 'Agenda', description: 'Agenda endpoints' },
            ]
        }
    }));