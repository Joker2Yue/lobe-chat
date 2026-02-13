import { neon } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-http';
import { drizzle as nodeDrizzle } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';

import { serverDBEnv } from '@/config/db';

import * as schema from '../schemas';
import type { LobeChatDatabase } from '../type';

export const getDBInstance = (): LobeChatDatabase => {
  if (process.env.NODE_ENV === 'test') {
    return {} as LobeChatDatabase;
  }

  if (!serverDBEnv.KEY_VAULTS_SECRET) {
    throw new Error('KEY_VAULTS_SECRET is not set');
  }

  const connectionString = serverDBEnv.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set correctly');
  }

  // Node 驱动（本地 / migration）
  if (serverDBEnv.DATABASE_DRIVER === 'node') {
    const client = new NodePool({ connectionString });
    return nodeDrizzle(client, { schema });
  }

  // ✅ 使用 HTTP 模式（兼容 Edge）
  const sql = neon(connectionString);
  return neonDrizzle(sql, { schema });
};
