import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_UDvO5EAluF6W@ep-dawn-mud-aq3lqe49-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

const posts = await sql('SELECT * FROM docs');

// See https://neon.com/docs/serverless/serverless-driver
// for more information