import { db } from '../../config/database';
import { Pedido, ItemPedido } from '../../@types';

export class PostgresOrderRepository {
  async create(pedido: Pedido): Promise<void> {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Insere o Pedido Principal
      const orderQuery = `
        INSERT INTO pedidos (id, cliente_id, total, data)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(orderQuery, [pedido.id, pedido.clienteId, pedido.total, pedido.data]);

      // 2. Insere os Itens do Pedido e Atualiza (Decrementa) o Estoque
      for (const item of pedido.itens) {
        const itemQuery = `
          INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
          VALUES ($1, $2, $3, $4);
        `;
        await client.query(itemQuery, [pedido.id, item.produtoId, item.quantidade, item.precoUnitario]);

        // Decrementa Estoque
        const updateStockQuery = `
          UPDATE produtos
          SET estoque = estoque - $1
          WHERE id = $2;
        `;
        await client.query(updateStockQuery, [item.quantidade, item.produtoId]);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Pedido | null> {
    const orderResult = await db.query('SELECT * FROM pedidos WHERE id = $1;', [id]);
    if (orderResult.rows.length === 0) return null;

    const row = orderResult.rows[0];

    const itemsResult = await db.query(
      'SELECT produto_id, quantidade, preco_unitario FROM itens_pedido WHERE pedido_id = $1;',
      [id]
    );

    const itens: ItemPedido[] = itemsResult.rows.map(item => ({
      produtoId: item.produto_id,
      quantidade: item.quantidade,
      precoUnitario: parseFloat(item.preco_unitario),
    }));

    return {
      id: row.id,
      clienteId: row.cliente_id,
      total: parseFloat(row.total),
      data: new Date(row.data),
      itens,
    };
  }

  async findByClientId(clienteId: string): Promise<Pedido[]> {
    const ordersResult = await db.query('SELECT * FROM pedidos WHERE cliente_id = $1 ORDER BY data DESC;', [clienteId]);
    const pedidos: Pedido[] = [];

    for (const row of ordersResult.rows) {
      const itemsResult = await db.query(
        'SELECT produto_id, quantidade, preco_unitario FROM itens_pedido WHERE pedido_id = $1;',
        [row.id]
      );

      const itens: ItemPedido[] = itemsResult.rows.map(item => ({
        produtoId: item.produto_id,
        quantidade: item.quantidade,
        precoUnitario: parseFloat(item.preco_unitario),
      }));

      pedidos.push({
        id: row.id,
        clienteId: row.cliente_id,
        total: parseFloat(row.total),
        data: new Date(row.data),
        itens,
      });
    }

    return pedidos;
  }
}
