import { PostgresProductRepository } from '../repositories/postgres/PostgresProductRepository';
import { PostgresClientRepository } from '../repositories/postgres/PostgresClientRepository';
import { db } from '../config/database';

async function testSprint1() {
  console.log("======================================================================");
  console.log(" MARTIM-PESCADOR E-COMMERCE CORP. | TESTE SPRINT 1 (POSTGRESQL DB)     ");
  console.log(" Operador Logístico: [Alfredino Schaldag] | Sessão: #0842-ATIVO          ");
  console.log("======================================================================\n");

  const productRepo = new PostgresProductRepository();
  const clientRepo = new PostgresClientRepository();

  try {
    // 1. Teste de Clientes Inicializados
    console.log("🔍 [1/4] Testando Consulta de Clientes Cadastrados...");
    const clientes = await clientRepo.findAll();
    console.log(`Total de clientes cadastrados: ${clientes.length}`);
    clientes.forEach(c => console.log(`   - [${c.id}] ${c.nome} (${c.email})`));

    // 2. Teste de Contagem do Catálogo
    console.log("\n📦 [2/4] Testando Leitura do Catálogo de Produtos...");
    const produtos = await productRepo.findAll();
    console.log(`Total de produtos no catálogo: ${produtos.length}`);

    // 3. Busca por Categoria
    console.log("\n🏷️ [3/4] Testando Filtro por Categoria 'Eletrônicos'...");
    const eletronicos = await productRepo.findByCategory('Eletrônicos');
    eletronicos.slice(0, 3).forEach(p => console.log(`   - [${p.id}] ${p.nome} | R$ ${p.preco.toFixed(2)} | Estoque: ${p.estoque}`));

    // 4. Teste de Busca por Nome Parcial
    console.log("\n🔎 [4/4] Testando Busca por Nome ('Air Fryer')...");
    const busca = await productRepo.findByName('Air Fryer');
    busca.forEach(p => console.log(`   - Encontrado: [${p.id}] ${p.nome} | R$ ${p.preco.toFixed(2)}`));

    console.log("\n======================================================================");
    console.log("    TESTE DA SPRINT 1 CONCLUÍDO COM SUCESSO!                          ");
    console.log("======================================================================");
  } catch (error) {
    console.error("\n❌ Erro durante a execução dos testes da Sprint 1:", error);
  } finally {
    await db.end();
  }
}

testSprint1();