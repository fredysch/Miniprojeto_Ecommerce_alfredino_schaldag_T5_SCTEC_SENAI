import { ItemCarrinho, Produto } from '../@types';
import { PostgresProductRepository } from '../repositories/postgres/PostgresProductRepository';

export class CartService {
  private itens: ItemCarrinho[] = [];

  constructor(private productRepo: PostgresProductRepository) {}

  async addItem(produtoId: string, quantidade: number): Promise<void> {
    if (quantidade <= 0) {
      throw new Error('A quantidade deve ser maior que zero.');
    }

    const produto = await this.productRepo.findById(produtoId);
    if (!produto) {
      throw new Error(`Produto com ID ${produtoId} não foi encontrado.`);
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

  removeItem(produtoId: string): boolean {
    const idx = this.itens.findIndex(item => item.produtoId === produtoId);
    if (idx !== -1) {
      this.itens.splice(idx, 1);
      return true;
    }
    return false;
  }

  clear(): void {
    this.itens = [];
  }

  getItems(): ItemCarrinho[] {
    return [...this.itens];
  }

  async calculateTotal(): Promise<{ total: number; detalhes: Array<{ produto: Produto; quantidade: number; subtotal: number }> }> {
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