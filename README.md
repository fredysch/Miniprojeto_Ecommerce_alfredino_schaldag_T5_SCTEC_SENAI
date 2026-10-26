# 🛒 Martim-Pescador E-Commerce Corp. | Back-End ERP-CLI

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)

Aplicação interativa de Terminal (CLI) para gerenciamento de catálogo, carrinho de compras, controle rigoroso de estoque e processamento relacional de pedidos. Projeto desenvolvido como requisito prático do curso de **Desenvolvimento Back-End Node.js (T5 - SENAI/SCTEC)**.

---

## 📐 Arquitetura do Sistema & Padrões de Projeto

O projeto segue os princípios da **Clean Architecture** e **Domain-Driven Design (DDD)**, mantendo estrita separação de responsabilidades em camadas:

mini_projeto_ecommerce/
├── docker/
│   ├── docker-compose.yml                  # Configuração da infraestrutura do PostgreSQL
│   └── postgres/
│       └── init.sql                        # Script DDL/DML de criação de tabelas e carga inicial
├── src/
│   ├── @types/
│   │   └── index.ts                         # Definição de Interfaces TypeScript (Cliente, Produto, Pedido, etc.)
│   ├── config/
│   │   └── database.ts                       # Pool de conexão parametrizado com o PostgreSQL (pg)
│   ├── repositories/
│   │   └── postgres/
│   │       ├── PostgresClientRepository.ts   # Consultas SQL para clientes
│   │       ├── PostgresProductRepository.ts  # Consultas SQL para produtos e categorias
│   │       └── PostgresOrderRepository.ts    # Transações SQL (BEGIN/COMMIT) para pedidos
│   ├── services/
│   │   ├── CartService.ts                     # Lógica de negócio do carrinho e controle de estoque
│   │   └── OrderService.ts                    # Lógica de checkout, congelamento de preços e validações
│   └── presentation/
│       └── cli.ts                              # Interface CLI interativa via terminal (Readline)
├── .gitignore                                  # Arquivos ignorados pelo Git (node_modules, etc.)
├── package.json                                # Dependências e scripts do projeto (npm run dev)
├── package-lock.json                           # Trava de versões das dependências
├── README.md                                   # Documentação completa do projeto
└── tsconfig.json                               # Configurações do compilador TypeScript

### 💡 Principais Diferenciais e Regras de Negócio

1. **Garantia de Atomicidade (Transações ACID):** O fechamento de compras (`OrderService.checkout`) utiliza blocos transacionais nativos do PostgreSQL (`BEGIN`, `COMMIT`, `ROLLBACK`) para assegurar que a criação do pedido, o registro dos itens e a baixa no estoque ocorram de forma totalmente atômica.

2. **Congelamento do Preço Histórico (`preco_unitario`):** Os valores dos produtos são congelados na tabela `itens_pedido` no momento exato do checkout, prevenindo reajustes retroativos em relatórios de vendas.

3. **Validação e Travamento de Estoque:** Impede a inserção de produtos sem saldo em estoque e rejeita solicitações onde a quantidade no carrinho ultrapasse a disponibilidade real no banco de dados.

4. **Segurança contra SQL Injection:** Todas as interações com o banco de dados utilizam consultas parametrizadas (`$1`, `$2`, `$3`).

---

## 🗄️ Modelagem do Banco de Dados Relacional

O banco de dados `ecommerce_db` possui a seguinte estrutura de tabelas e relacionamentos:

+------------------+         +--------------------+         +-----------------------+
|     CLIENTES     |         |      PEDIDOS       |         |     ITENS_PEDIDO      |
+------------------+         +--------------------+         +-----------------------+
| id (PK)          |<-------1| id (PK)            |<-------1| id (PK)               |
| nome             |        *| cliente_id (FK)    |        *| pedido_id (FK)        |
| email            |         | total              |         | produto_id (FK)------+|
| criado_em        |         | data               |         | quantidade           ||
+------------------+         +--------------------+         | preco_unitario       ||
+-----------------------+|
||
+--------------------+                         ||
|      PRODUTOS      |                         ||
+--------------------+                         ||
| id (PK)            |<------------------------+|
| nome               |
| descricao          |
| preco              |
| estoque            |
| categoria          |
+--------------------+


---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** TypeScript 5.9
* **Ambiente de Execução:** Node.js v18+ com `ts-node-dev`
* **Banco de Dados Relacional:** PostgreSQL 15 (Alpine)
* **Driver de Banco:** `pg` (`node-postgres` Pool connection)
* **Conteinerização:** Docker & Docker Compose
* **Controle de Versão:** Git / GitHub (Conventional Commits)

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
* **Node.js** (v18 ou superior)
* **Docker** e **Docker Compose** instalados e em execução.

### 2. Clonar o Repositório
```bash
git clone [https://github.com/fredysch/Miniprojeto_Ecommerce_alfredino_schaldag_T5_SCTEC_SENAI.git](https://github.com/fredysch/Miniprojeto_Ecommerce_alfredino_schaldag_T5_SCTEC_SENAI.git)
cd mini_projeto_ecommerce
3. Subir a Infraestrutura PostgreSQL via Docker
O ambiente conteinerizado está pré-configurado para mapear a porta 5436 do host para a porta 5432 interna do PostgreSQL, inicializando automaticamente as tabelas e dados populados via init.sql:

Bash
sudo docker compose -f docker/docker-compose.yml up -d

4. Instalar Dependências e Iniciar a Aplicação
Bash
npm install
npm run dev
📺 Dica de Apresentação: Execução em Terminal Dividido
Para visualizar a baixa de estoque em tempo real enquanto interage com a CLI:

Painel da Esquerda (Aplicação CLI):

Bash
npm run dev
Painel da Direita (Monitoramento do Banco em Tempo Real):

Bash
watch -n 1 "PGPASSWORD=secretpassword psql -h localhost -p 5436 -U postgres -d ecommerce_db -c 'SELECT id, nome, categoria, preco, estoque FROM produtos ORDER BY id;'"
✒️ Autor
Desenvolvedor: Alfredino Schaldag

Instituição: SENAI / SCTEC

Curso: Desenvolvimento Back-End Node.js — Turma T5


---

## 📌 Passo 2: Commit & Push Final

Agora que a CLI interativa e a documentação completa estão salvas no repositório local, execute a sequência de comandos no seu terminal para registrar o commit atômico e sincronizar com o GitHub:

```bash
# 1. Adiciona todas as alterações e a nova documentação detalhada
git add .

# 2. Cria o commit final no padrão Conventional Commits
git commit -m "docs(readme): adiciona documentacao completa com diagramas er, comandos docker e guia cli"

# 3. Envia todas as atualizações para a branch main no GitHub
git push origin main