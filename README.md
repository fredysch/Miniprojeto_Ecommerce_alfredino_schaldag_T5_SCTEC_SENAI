# 🛒 Martim-Pescador E-Commerce Corp. | Back-End ERP-CLI

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

---

## 👤 Identificação
* **Nome do Estudante:** Alfredino Schaldag
* **Turma:** SENAI / SCTEC — Desenvolvimento Back-End Node.js (Turma T5)
* **Projeto:** Mini Projeto E-Commerce (Sprints 1 a 4)

---

## 🎯 Objetivo da Aplicação
O objetivo desta aplicação é fornecer uma plataforma de e-commerce via interface de linha de comando (CLI) desenvolvida em Node.js com TypeScript, simulando a operação completa de um ERP logístico e de vendas. O sistema consome um banco de dados relacional PostgreSQL conteinerizado em Docker, aplicando persistência de dados, controle rigoroso de estoque e processamento transacional de pedidos.

---

## ⚙️ Funcionalidades Implementadas

* **Consulta ao Catálogo de Produtos:** Listagem geral de produtos e filtros por categorias (Eletrônicos, Vestuário, Livros, Calçados).
* **Gerenciamento do Carrinho de Compras:** Adição de itens, alteração/acumulo de quantidades e cálculo de subtotal por item e total geral.
* **Processamento de Checkout Relacional:** Fechamento de compras com criação de registro de pedido e itens de pedido no banco de dados.
* **Gestão de Clientes:** Listagem dos clientes cadastrados e alternância de sessão ativa entre clientes.
* **Histórico de Compras:** Consulta detalhada aos pedidos finalizados por cliente com exibição de itens e valores históricos.
* **Infraestrutura Conteinerizada:** Subida automática do banco de dados PostgreSQL com carga SQL de inicialização (`init.sql`).

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript 5.9
* **Ambiente de Execução:** Node.js v18+ com `ts-node-dev`
* **Banco de Dados Relacional:** PostgreSQL 15 (Alpine)
* **Driver de Banco:** `pg` (`node-postgres` Pool connection)
* **Conteinerização:** Docker & Docker Compose
* **Interface:** Node.js `readline` (CLI interativa)
* **Controle de Versão:** Git / GitHub (Conventional Commits)

---

## 📂 Estrutura dos Arquivos

```text
mini_projeto_ecommerce/
├── docker/
│   ├── docker-compose.yml     # Configuração da infraestrutura do PostgreSQL
│   └── postgres/
│       └── init.sql           # Script DDL/DML de criação de tabelas e carga inicial
├── src/
│   ├── @types/
│   │   └── index.ts           # Definição de Interfaces TypeScript
│   ├── config/
│   │   └── database.ts        # Pool de conexão com PostgreSQL (pg)
│   ├── repositories/
│   │   └── postgres/
│   │       ├── PostgresClientRepository.ts   # Consultas SQL de clientes
│   │       ├── PostgresProductRepository.ts  # Consultas SQL de produtos
│   │       └── PostgresOrderRepository.ts    # Transações SQL (BEGIN/COMMIT) de pedidos
│   ├── services/
│   │   ├── CartService.ts     # Regras de negócio do carrinho e estoque
│   │   └── OrderService.ts    # Lógica de checkout e congelamento de preços
│   └── presentation/
│       └── cli.ts             # Interface CLI interativa (Readline)
├── .gitignore                 # Arquivos ignorados pelo Git
├── package.json               # Dependências e scripts (npm run dev)
├── package-lock.json          # Trava de versões das dependências
├── README.md                  # Documentação completa do projeto
└── tsconfig.json              # Configurações do TypeScript

📐 Regras de Negócio Implementadas
Garantia de Atomicidade (Transações ACID): O fechamento de compras (OrderService.checkout) utiliza blocos transacionais nativos do PostgreSQL (BEGIN, COMMIT, ROLLBACK) para assegurar que a criação do pedido, o registro dos itens e a baixa no estoque ocorram de forma totalmente atômica.

Congelamento do Preço Histórico (preco_unitario): Os valores dos produtos são congelados na tabela itens_pedido no momento exato do checkout, prevenindo reajustes retroativos em relatórios de vendas futuros.

Validação de Estoque Disponível: Impede a inserção de produtos com estoque zerado no carrinho e rejeita solicitações onde a quantidade no carrinho ultrapasse a disponibilidade real no banco de dados.

Carrinho Não-Vazio: O checkout só é liberado se houver ao menos um item válido no carrinho de compras.

Segurança contra SQL Injection: Todas as interações com o banco de dados utilizam consultas parametrizadas ($1, $2, $3).

💻 Instruções de Compilação e Execução
1. Pré-requisitos
Node.js (v18 ou superior)

Docker e Docker Compose instalados e em execução.

2. Clonar o Repositório
Bash
git clone https://github.com/fredysch/Miniprojeto_Ecommerce_alfredino_schaldag_T5_SCTEC_SENAI.git
cd mini_projeto_ecommerce
3. Subir o Banco de Dados PostgreSQL via Docker
Execute o comando abaixo para criar o contêiner e rodar automaticamente o script init.sql (porta host 5436):

Bash
sudo docker compose -f docker/docker-compose.yml up -d
4. Instalar Dependências e Executar a CLI
Bash
npm install
npm run dev
🖥️ Exemplos das Principais Operações
A. Fluxo de Compra e Baixa no Estoque na CLI
Plaintext
======================================================================
 MARTIM-PESCADOR E-COMMERCE CORP. | PAINEL DE CONTROLE CLI          
 Operador Logístico: [Alfredino Schaldag] | Cliente: Carlos Eduardo
======================================================================

1. 🛒 Listar Catálogo de Produtos
2. 🔍 Filtrar Produtos por Categoria
3. ➕ Adicionar Item ao Carrinho
4. 🛍️ Ver Carrinho & Total
5. 💳 Finalizar Compra (Checkout)
6. 📜 Historico de Pedidos do Cliente
7. 👤 Alternar Cliente Ativo
0. 🚪 Sair
----------------------------------------------------------------------
Selecione uma opção: 3

Informe o ID do Produto (ex: prod-101): prod-101
Informe a Quantidade: 1
✅ Item adicionado com sucesso ao carrinho!
B. Monitoramento do PostgreSQL em Terminal Dividido
Em um segundo terminal, execute o comando abaixo para visualizar a atualização das tabelas em tempo real:

Bash
watch -n 1 "PGPASSWORD=secretpassword psql -h localhost -p 5436 -U postgres -d ecommerce_db -c 'SELECT id, nome, categoria, preco, estoque FROM produtos ORDER BY id;'"
⚠️ Limitações Conhecidas do Sistema
Estado do Carrinho em Memória: Os itens do carrinho ficam mantidos na memória RAM da aplicação Node.js enquanto a sessão da CLI estiver ativa; reiniciar a CLI esvazia o carrinho antes do checkout.

Sessão Single-User no Terminal: A interface CLI gerencia um cliente ativo por vez através da navegação do menu, sem sistema de autenticação via token/JWT.

Formas de Pagamento e Frete: O sistema foca no fluxo Back-End e relacional de estoque e pedidos, sem integração externa com gateways de pagamento ou cálculo logístico de frete.