export type CategoriaProduto = 'Eletrônicos' | 'Vestuário' | 'Eletrodomésticos' | 'Perfumaria' | 'Outros';

export interface Produto {
  id: string;
  nome: string;
  categoria: CategoriaProduto;
  preco: number;
  estoque: number;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
}

export interface ItemCarrinho {
  produtoId: string;
  quantidade: number;
}

export interface ItemPedido {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: string;
  clienteId: string;
  itens: ItemPedido[];
  total: number;
  data: Date;
}