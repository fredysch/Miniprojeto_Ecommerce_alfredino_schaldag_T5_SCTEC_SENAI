import { ItemCarrinho, Produto } from '../@types';
import { PostgresProductRepository } from '../repositories/postgres/PostgresProductRepository';

export class CartService {
  private itens: ItemCarrinho[] = [];

  constructor(private productRepo: PostgresProductRepository) {}

  /**
   * Adiciona um produto ao carrinho ou acumula a quantidade se já existir.
   */
  async addItem(produtoId: string, quantidade: number): Promise<void> {
    if (quantidade <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    const produto = await this.productRepo.findById(produtoId);
    if (!produto) {
      throw new Error(`Produto com ID "${produtoId}" não foi encontrado.`);
    }

    const itemExistente = this.itens.find(item => item.produtoId === produtoId);
    const qtdAtualNoCarrinho = itemExistente ? itemExistente.quantidade : 0;
    const qtdTotalDesejada = qtdAtualNoCarrinho + quantidade;

    if (qtdTotalDesejada > produto.estoque) {
      throw new Error(
        `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque}, Solicitado: ${qtdTotalDesejada}`
      );
    }

    if (itemExistente) {
      itemExistente.quantidade = qtdTotalDesejada;
    } else {
      this.itens.push({ produtoId, quantidade });
    }
  }

  /**
   * Remove completamente um produto do carrinho pelo ID.
   */
  removeItem(produtoId: string): void {
    const index = this.itens.findIndex(item => item.produtoId === produtoId);
    if (index === -1) {
      throw new Error(`Produto com ID "${produtoId}" não está presente no carrinho.`);
    }
    this.itens.splice(index, 1);
  }

  /**
   * Altera diretamente a quantidade de um produto específico no carrinho.
   */
  async updateItemQuantity(produtoId: string, novaQuantidade: number): Promise<void> {
    if (novaQuantidade <= 0) {
      // Se a quantidade informada for zero ou negativa, remove o item
      this.removeItem(produtoId);
      return;
    }

    const produto = await this.productRepo.findById(produtoId);
    if (!produto) {
      throw new Error(`Produto com ID "${produtoId}" não foi encontrado.`);
    }

    if (novaQuantidade > produto.estoque) {
      throw new Error(
        `Estoque insuficiente para o produto "${produto.nome}". Disponível: ${produto.estoque}, Solicitado: ${novaQuantidade}`
      );
    }

    const item = this.itens.find(item => item.produtoId === produtoId);
    if (!item) {
      throw new Error(`Produto com ID "${produtoId}" não encontrado no carrinho.`);
    }

    item.quantidade = novaQuantidade;
  }

  /**
   * Retorna a lista de itens do carrinho contendo identificador e quantidade.
   */
  getItems(): ItemCarrinho[] {
    return [...this.itens];
  }

  /**
   * Esvazia completamente o carrinho.
   */
  clear(): void {
    this.itens = [];
  }

  /**
   * Calcula o subtotal de cada item e o valor total geral da compra.
   */
  async calculateTotal(): Promise<{
    total: number;
    detalhes: Array<{ produto: Produto; quantidade: number; subtotal: number }>;
  }> {
    let total = 0;
    const detalhes = [];

    for (const item of this.itens) {
      const produto = await this.productRepo.findById(item.produtoId);
      if (produto) {
        const subtotal = produto.preco * item.quantidade;
        total += subtotal;
        detalhes.push({
          produto,
          quantidade: item.quantidade,
          subtotal,
        });
      }
    }

    return { total, detalhes };
  }
}