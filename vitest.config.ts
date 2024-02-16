import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            provider: 'istanbul', // or 'v8'
            // all: true,
            // include: [
            //     '**/*.ts',
            //     'src/use-case/*.test.ts'
            // ],
            // reporter: ['html'],
            // reportsDirectory: './coverage'
        },
        // reporters: ['default', 'html']
    },
})