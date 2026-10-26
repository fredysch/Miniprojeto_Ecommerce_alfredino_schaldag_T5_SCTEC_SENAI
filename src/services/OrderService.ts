import { Pedido, ItemPedido } from '../@types';
import { PostgresProductRepository } from '../repositories/postgres/PostgresProductRepository';
import { PostgresClientRepository } from '../repositories/postgres/PostgresClientRepository';
import { PostgresOrderRepository } from '../repositories/postgres/PostgresOrderRepository';
import { CartService } from './CartService';

export class OrderService {
  constructor(
    private productRepo: PostgresProductRepository,
    private clientRepo: PostgresClientRepository,
    private orderRepo: PostgresOrderRepository
  ) {}

  async checkout(clienteId: string, cartService: CartService): Promise<Pedido> {
    // 1. Valida Cliente
    const cliente = await this.clientRepo.findById(clienteId);
    if (!cliente) {
      throw new Error(`Cliente com ID "${clienteId}" não encontrado.`);
    }

    // 2. Valida Carrinho Vazio
    const cartItems = cartService.getItems();
    if (cartItems.length === 0) {
      throw new Error('Não é possível finalizar um pedido com o carrinho vazio.');
    }

    // 3. Valida Estoque Atualizado de Cada Item
    const itensPedido: ItemPedido[] = [];
    let totalPedido = 0;

    for (const item of cartItems) {
      const produto = await this.productRepo.findById(item.produtoId);

      if (!produto) {
        throw new Error(`Produto ${item.produtoId} não encontrado durante a validação final.`);
      }

      if (produto.estoque < item.quantidade) {
        throw new Error(
          `Estoque do produto "${produto.nome}" mudou! Disponível: ${produto.estoque}, Solicitado: ${item.quantidade}`
        );
      }

      const subtotal = produto.preco * item.quantidade;
      totalPedido += subtotal;

      itensPedido.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        precoUnitario: produto.preco, // Congela o preço histórico
      });
    }

    // 4. Monta o Objeto de Pedido
    const novoPedido: Pedido = {
      id: `ped-${Date.now()}`,
      clienteId: cliente.id,
      itens: itensPedido,
      total: totalPedido,
      data: new Date(),
    };

    // 5. Persiste no Postgres (com transação e atualização de estoque)
    await this.orderRepo.create(novoPedido);

    // 6. Limpa o Carrinho após sucesso
    cartService.clear();

    return novoPedido;
  }
}