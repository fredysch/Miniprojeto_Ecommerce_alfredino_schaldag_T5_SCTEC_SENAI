import { db } from '../../config/database';
import { Produto, CategoriaProduto } from '../../@types';

export class PostgresProductRepository {
  async create(produto: Produto): Promise<void> {
    const query = `
      INSERT INTO produtos (id, nome, categoria, preco, estoque)
      VALUES ($1, $2, $3, $4, $5);
    `;
    await db.query(query, [produto.id, produto.nome, produto.categoria, produto.preco, produto.estoque]);
  }

  async findAll(): Promise<Produto[]> {
    const result = await db.query('SELECT * FROM produtos ORDER BY id;');
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      categoria: row.categoria as CategoriaProduto,
      preco: parseFloat(row.preco),
      estoque: row.estoque,
    }));
  }

  async findById(id: string): Promise<Produto | null> {
    const result = await db.query('SELECT * FROM produtos WHERE id = $1;', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      categoria: row.categoria as CategoriaProduto,
      preco: parseFloat(row.preco),
      estoque: row.estoque,
    };
  }

  async findByName(termo: string): Promise<Produto[]> {
    const query = 'SELECT * FROM produtos WHERE LOWER(nome) LIKE LOWER($1) ORDER BY nome;';
    const result = await db.query(query, [`%${termo}%`]);
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      categoria: row.categoria as CategoriaProduto,
      preco: parseFloat(row.preco),
      estoque: row.estoque,
    }));
  }

  async findByCategory(categoria: CategoriaProduto): Promise<Produto[]> {
    const query = 'SELECT * FROM produtos WHERE categoria = $1 ORDER BY nome;';
    const result = await db.query(query, [categoria]);
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      categoria: row.categoria as CategoriaProduto,
      preco: parseFloat(row.preco),
      estoque: row.estoque,
    }));
  }

  async update(id: string, produto: Partial<Produto>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (produto.nome !== undefined) { fields.push(`nome = $${idx++}`); values.push(produto.nome); }
    if (produto.categoria !== undefined) { fields.push(`categoria = $${idx++}`); values.push(produto.categoria); }
    if (produto.preco !== undefined) { fields.push(`preco = $${idx++}`); values.push(produto.preco); }
    if (produto.estoque !== undefined) { fields.push(`estoque = $${idx++}`); values.push(produto.estoque); }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE produtos SET ${fields.join(', ')} WHERE id = $${idx};`;
    const result = await db.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.query('DELETE FROM produtos WHERE id = $1;', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}