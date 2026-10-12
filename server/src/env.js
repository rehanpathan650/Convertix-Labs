import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, '../../.env') }); // root .env (Docker passes env directly)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) throw new Error('Set JWT_SECRET (16+ chars) in .env');
export const isProd = process.env.NODE_ENV === 'production';
