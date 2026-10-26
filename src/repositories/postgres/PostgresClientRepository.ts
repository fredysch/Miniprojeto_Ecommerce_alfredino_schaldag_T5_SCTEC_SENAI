import { db } from '../../config/database';
import { Cliente } from '../../@types';

export class PostgresClientRepository {
  async create(cliente: Cliente): Promise<void> {
    const query = 'INSERT INTO clientes (id, nome, email) VALUES ($1, $2, $3);';
    await db.query(query, [cliente.id, cliente.nome, cliente.email]);
  }

  async findAll(): Promise<Cliente[]> {
    const result = await db.query('SELECT * FROM clientes ORDER BY id;');
    return result.rows;
  }

  async findById(id: string): Promise<Cliente | null> {
    const result = await db.query('SELECT * FROM clientes WHERE id = $1;', [id]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const result = await db.query('SELECT * FROM clientes WHERE email = $1;', [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }
}