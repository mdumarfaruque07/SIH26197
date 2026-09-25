import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

function getSanitizedDatabaseUrl() {
  let dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl && dbUrl.startsWith('mysql://')) {
    try {
      const lastAtIdx = dbUrl.lastIndexOf('@');
      if (lastAtIdx > 8) {
        const authPart = dbUrl.substring(8, lastAtIdx);
        const hostPart = dbUrl.substring(lastAtIdx + 1);
        const colonIdx = authPart.indexOf(':');
        if (colonIdx !== -1) {
          const user = authPart.substring(0, colonIdx);
          const rawPass = authPart.substring(colonIdx + 1);
          let safePass = rawPass;
          try {
            safePass = encodeURIComponent(decodeURIComponent(rawPass));
          } catch {
            safePass = encodeURIComponent(rawPass);
          }
          return `mysql://${user}:${safePass}@${hostPart}`;
        }
      }
    } catch (e) {
      console.warn('Failed to sanitize DATABASE_URL:', e);
    }
  }
  return dbUrl;
}

const sanitizedUrl = getSanitizedDatabaseUrl();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: sanitizedUrl,
    },
  },
});

export default prisma;
