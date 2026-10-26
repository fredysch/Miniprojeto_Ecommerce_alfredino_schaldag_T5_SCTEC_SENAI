import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5436,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'secretpassword',
  database: process.env.DB_NAME || 'ecommerce_db',
  connectionTimeoutMillis: 5000, // Timeout de conexão para evitar travamentos
});

db.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente do PostgreSQL:', err);
});