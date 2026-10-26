import readline from 'readline';
import { db } from '../config/database';
import { PostgresProductRepository } from '../repositories/postgres/PostgresProductRepository';
import { PostgresClientRepository } from '../repositories/postgres/PostgresClientRepository';
import { PostgresOrderRepository } from '../repositories/postgres/PostgresOrderRepository';
import { CartService } from '../services/CartService';
import { OrderService } from '../services/OrderService';

const productRepo = new PostgresProductRepository();
const clientRepo = new PostgresClientRepository();
const orderRepo = new PostgresOrderRepository();

const cartService = new CartService(productRepo);
const orderService = new OrderService(productRepo, clientRepo, orderRepo);

let clienteAtualId = 'cli-001'; // Cliente Padrão: Carlos Eduardo

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function showHeader() {
  console.clear();
  const cliente = await clientRepo.findById(clienteAtualId);
  console.log('======================================================================');
  console.log(' MARTIM-PESCADOR E-COMMERCE CORP. | PAINEL DE CONTROLE CLI          ');
  console.log(` Operador Logístico: [Alfredino Schaldag] | Cliente: ${cliente?.nome || 'N/A'}`);
  console.log('======================================================================\n');
}

async function menu() {
  await showHeader();
  console.log('1. 🛒 Listar Catálogo de Produtos');
  console.log('2. 🔍 Filtrar Produtos por Categoria');
  console.log('3. ➕ Adicionar Item ao Carrinho');
  console.log('4. ✏️ Alterar Quantidade de Item no Carrinho');
  console.log('5. 🗑️ Remover Item do Carrinho');
  console.log('6. 🛍️ Ver Carrinho & Total (Subtotais)');
  console.log('7. 💳 Finalizar Compra (Checkout)');
  console.log('8. 📜 Histórico de Pedidos do Cliente');
  console.log('9. 👤 Alternar Cliente Ativo');
  console.log('0. 🚪 Sair');
  console.log('----------------------------------------------------------------------');

  const opcao = await askQuestion('Selecione uma opção: ');

  switch (opcao.trim()) {
    case '1':
      await listarProdutos();
      break;
    case '2':
      await filtrarPorCategoria();
      break;
    case '3':
      await adicionarAoCarrinho();
      break;
    case '4':
      await alterarQuantidadeCarrinho();
      break;
    case '5':
      await removerDoCarrinho();
      break;
    case '6':
      await verCarrinho();
      break;
    case '7':
      await finalizarCompra();
      break;
    case '8':
      await verHistorico();
      break;
    case '9':
      await alternarCliente();
      break;
    case '0':
      console.log('\nSaindo da plataforma... Até logo!');
      await db.end();
      rl.close();
      process.exit(0);
    default:
      await askQuestion('\n❌ Opção inválida. Pressione ENTER para tentar novamente.');
      await menu();
  }
}

async function listarProdutos() {
  await showHeader();
  console.log('--- CATÁLOGO DE PRODUTOS ---\n');
  const produtos = await productRepo.findAll();
  console.table(
    produtos.map((p) => ({
      ID: p.id,
      Nome: p.nome,
      Categoria: p.categoria,
      Preço: `R$ ${p.preco.toFixed(2)}`,
      Estoque: p.estoque,
    }))
  );
  await askQuestion('\nPressione ENTER para voltar ao menu principal.');
  await menu();
}

async function filtrarPorCategoria() {
  await showHeader();
  console.log('Categorias disponíveis: Eletrônicos, Vestuário, Livros, Calçados');
  const cat = await askQuestion('\nDigite o nome da categoria: ');
  const produtos = await productRepo.findByCategory(cat.trim());

  if (produtos.length === 0) {
    console.log(`\nNenhum produto encontrado para a categoria "${cat}".`);
  } else {
    console.table(
      produtos.map((p) => ({
        ID: p.id,
        Nome: p.nome,
        Preço: `R$ ${p.preco.toFixed(2)}`,
        Estoque: p.estoque,
      }))
    );
  }
  await askQuestion('\nPressione ENTER para voltar ao menu principal.');
  await menu();
}

async function adicionarAoCarrinho() {
  await showHeader();
  console.log('--- ADICIONAR AO CARRINHO ---\n');
  const prodId = await askQuestion('Informe o ID do Produto (ex: prod-101): ');
  const qtdStr = await askQuestion('Informe a Quantidade: ');

  try {
    const qtd = parseInt(qtdStr.trim(), 10);
    await cartService.addItem(prodId.trim(), qtd);
    console.log('\n✅ Item adicionado com sucesso ao carrinho!');
  } catch (err: any) {
    console.log(`\n❌ Erro ao adicionar item: ${err.message}`);
  }

  await askQuestion('\nPressione ENTER para continuar.');
  await menu();
}

async function alterarQuantidadeCarrinho() {
  await showHeader();
  console.log('--- ALTERAR QUANTIDADE NO CARRINHO ---\n');
  const prodId = await askQuestion('Informe o ID do Produto no Carrinho: ');
  const qtdStr = await askQuestion('Informe a Nova Quantidade (0 para remover): ');

  try {
    const novaQtd = parseInt(qtdStr.trim(), 10);
    await cartService.updateItemQuantity(prodId.trim(), novaQtd);
    console.log('\n✅ Quantidade atualizada com sucesso!');
  } catch (err: any) {
    console.log(`\n❌ Erro ao atualizar quantidade: ${err.message}`);
  }

  await askQuestion('\nPressione ENTER para continuar.');
  await menu();
}

async function removerDoCarrinho() {
  await showHeader();
  console.log('--- REMOVER ITEM DO CARRINHO ---\n');
  const prodId = await askQuestion('Informe o ID do Produto a ser removido: ');

  try {
    cartService.removeItem(prodId.trim());
    console.log('\n✅ Produto removido do carrinho com sucesso!');
  } catch (err: any) {
    console.log(`\n❌ Erro ao remover item: ${err.message}`);
  }

  await askQuestion('\nPressione ENTER para continuar.');
  await menu();
}

async function verCarrinho() {
  await showHeader();
  console.log('--- SEU CARRINHO DE COMPRAS ---\n');
  const resumo = await cartService.calculateTotal();

  if (resumo.detalhes.length === 0) {
    console.log('Seu carrinho está vazio.');
  } else {
    console.table(
      resumo.detalhes.map((d) => ({
        ID: d.produto.id,
        Produto: d.produto.nome,
        Qtd: d.quantidade,
        'Preço Unit.': `R$ ${d.produto.preco.toFixed(2)}`,
        Subtotal: `R$ ${d.subtotal.toFixed(2)}`,
      }))
    );
    console.log(`\n💰 Total Geral da Compra: R$ ${resumo.total.toFixed(2)}`);
  }

  await askQuestion('\nPressione ENTER para voltar ao menu principal.');
  await menu();
}

async function finalizarCompra() {
  await showHeader();
  console.log('--- CHECKOUT & FINALIZAÇÃO ---\n');

  try {
    const pedido = await orderService.checkout(clienteAtualId, cartService);
    console.log(`🎉 COMPRA REALIZADA COM SUCESSO!`);
    console.log(`   Número do Pedido: ${pedido.id}`);
    console.log(`   Valor Total: R$ ${pedido.total.toFixed(2)}`);
    console.log(`   Data/Hora: ${pedido.data.toLocaleString()}`);
  } catch (err: any) {
    console.log(`❌ Erro no checkout: ${err.message}`);
  }

  await askQuestion('\nPressione ENTER para continuar.');
  await menu();
}

async function verHistorico() {
  await showHeader();
  console.log('--- HISTÓRICO DE PEDIDOS ---\n');
  const pedidos = await orderRepo.findByClientId(clienteAtualId);

  if (pedidos.length === 0) {
    console.log('Nenhum pedido encontrado para o cliente ativo.');
  } else {
    pedidos.forEach((p) => {
      console.log(`📦 Pedido: ${p.id} | Data: ${p.data.toLocaleString()} | Total: R$ ${p.total.toFixed(2)}`);
      p.itens.forEach((i) => {
        console.log(`   └─ Prod ID: ${i.produtoId} | Qtd: ${i.quantidade} | Preço Histórico: R$ ${i.precoUnitario.toFixed(2)}`);
      });
      console.log('----------------------------------------------------------------------');
    });
  }

  await askQuestion('\nPressione ENTER para voltar ao menu principal.');
  await menu();
}

async function alternarCliente() {
  await showHeader();
  console.log('--- CLIENTES CADASTRADOS ---\n');
  const clientes = await clientRepo.findAll();
  console.table(clientes);

  const novoId = await askQuestion('\nDigite o ID do cliente que deseja assumir: ');
  const clienteExiste = await clientRepo.findById(novoId.trim());

  if (clienteExiste) {
    clienteAtualId = novoId.trim();
    console.log(`\n✅ Cliente alterado para: ${clienteExiste.nome}`);
  } else {
    console.log('\n❌ Cliente não encontrado.');
  }

  await askQuestion('\nPressione ENTER para voltar.');
  await menu();
}

menu();