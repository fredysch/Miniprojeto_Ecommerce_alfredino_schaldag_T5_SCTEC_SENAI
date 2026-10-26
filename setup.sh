#!/bin/bash

# Interrompe o script em caso de erro
set -e

echo "======================================================================"
echo "    INICIANDO A ESTRUTURAÇÃO DO PROJETO: E-COMMERCE ERP-CLI            "
echo "======================================================================"

# 1. Criação da Estrutura de Diretórios
echo "[1/6] Criando diretórios da arquitetura modular..."
mkdir -p src/@types
mkdir -p src/config
mkdir -p src/domain/entities
mkdir -p src/domain/value-objects
mkdir -p src/repositories/in-memory
mkdir -p src/repositories/postgres
mkdir -p src/services
mkdir -p src/presentation/menus
mkdir -p src/presentation/components
mkdir -p docker/postgres

# 2. Inicialização do Node.js e Instalação de Dependências
echo "[2/6] Configurando o package.json e dependências..."
cat << 'EOF' > package.json
{
  "name": "miniprojeto-ecommerce-alfredino-t5",
  "version": "1.0.0",
  "description": "Sistema de Gerenciamento de E-commerce com TypeScript (ERP-CLI)",
  "main": "dist/presentation/cli.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/presentation/cli.js",
    "dev": "ts-node-dev --respawn --transpile-only src/presentation/cli.ts"
  },
  "keywords": ["ecommerce", "cli", "typescript", "senai"],
  "author": "Alfredino Schaldag",
  "license": "ISC",
  "devDependencies": {
    "@types/node": "^20.11.0",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.3"
  },
  "dependencies": {
    "pg": "^8.11.3"
  }
}
EOF

# 3. Configuração do TypeScript
echo "[3/6] Criando arquivo tsconfig.json..."
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
EOF

# 4. Configuração do Docker e Docker Compose
echo "[4/6] Configurando Dockerfile e Docker Compose..."
cat << 'EOF' > Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
EOF

cat << 'EOF' > docker/docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: ecommerce_postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: ecommerce_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
    pgdata:
EOF

# 5. Criação de Arquivos Base (Placeholders e Tipos)
echo "[5/6] Criando arquivos base do sistema..."

cat << 'EOF' > src/@types/index.ts
export type CategoriaProduto = 'Eletrônicos' | 'Vestuário' | 'Alimentação' | 'Outros';

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
EOF

cat << 'EOF' > src/presentation/cli.ts
import { Produto } from '../@types';

console.log("======================================================================");
console.log(" MARTIM-PESCADOR E-COMMERCE CORP. | SISTEMA DE GESTÃO COMERCIAL (ERP-CLI) ");
console.log(" Operador Logístico: [Alfredino Schaldag] | Sessão: #0842-ATIVO          ");
console.log("======================================================================");
console.log("Sistema inicializado com sucesso. Módulos carregados.");
EOF

# 6. Inicialização do Git e Primeiro Commit
echo "[6/6] Inicializando repositório Git e realizando o primeiro commit..."
git init
git add .
git commit -m "feat: estrutura inicial do projeto e-commerce erp-cli com arquitetura modular"

echo "======================================================================"
echo "    ESTRUTURA CONCLUÍDA COM SUCESSO!                                  "
echo "======================================================================"
echo "Próximos passos:"
echo "1. Crie o repositório no GitHub com o nome solicitado: Miniprojeto_Ecommerce_Alfredino_T5"
echo "2. Vincule o remote: git remote add origin <url-do-seu-repo>"
echo "3. Envie o código: git push -u origin main"
echo "4. Para subir o banco via Docker: docker compose -f docker/docker-compose.yml up -d"
echo "======================================================================"
