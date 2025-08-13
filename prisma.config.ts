import 'dotenv/config'; // This line loads your .env file
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
    schema: path.join('src', 'prisma'),
});
