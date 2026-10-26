-- ======================================================================
-- E-COMMERCE ERP-CLI - SCRIPT DE ESTRUTURA E CARGA INICIAL (DDL & DML)
-- Autor: Alfredino Schaldag | Turma T5 - SENAI
-- ======================================================================

-- 1. Criação da Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
    estoque INT NOT NULL CHECK (estoque >= 0)
);

-- 2. Criação da Tabela de Clientes (3 Clientes Obrigatórios pelo Enunciado)
CREATE TABLE IF NOT EXISTS clientes (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL
);

-- 3. Criação da Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(36) PRIMARY KEY,
    cliente_id VARCHAR(36) NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criação da Tabela de Itens do Pedido (Preserva Preço Histórico)
CREATE TABLE IF NOT EXISTS itens_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id VARCHAR(36) NOT NULL REFERENCES produtos(id) ON DELETE RESTRICT,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario > 0)
);

-- ======================================================================
-- CARGA INICIAL DE DADOS (DML)
-- ======================================================================

-- A. Clientes Obrigatórios
INSERT INTO clientes (id, nome, email) VALUES
('cli-001', 'Carlos Eduardo Silva', 'carlos.silva@email.com'),
('cli-002', 'Mariana Rocha', 'mariana.rocha@email.com'),
('cli-003', 'Roberto Santos', 'roberto.santos@email.com')
ON CONFLICT (id) DO NOTHING;

-- B. Catálogo de Produtos (40 Itens)

-- 1. ELETRÔNICOS (10 Itens - prod-101 a prod-110)
INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
('prod-101', 'Smartphone Galaxy S24 Ultra 512GB', 'Eletrônicos', 6499.00, 10),
('prod-102', 'Notebook Dell XPS 15 i7 32GB RAM', 'Eletrônicos', 9800.00, 5),
('prod-103', 'Monitor Gamer Curved 34" 165Hz', 'Eletrônicos', 2899.90, 8),
('prod-104', 'Teclado Mecânico Wireless RGB', 'Eletrônicos', 450.00, 15),
('prod-105', 'Mouse Optico Ergonomico 16000 DPI', 'Eletrônicos', 180.00, 20),
('prod-106', 'Fone de Ouvido Bluetooth Noise Cancelling', 'Eletrônicos', 899.00, 12),
('prod-107', 'Smartwatch Sport GPS Pro', 'Eletrônicos', 1250.00, 7),
('prod-108', 'Placa de Vídeo RTX 4070 Super 12GB', 'Eletrônicos', 4399.90, 0), -- [TESTE ESTOQUE ZERADO]
('prod-109', 'SSD M.2 NVMe 2TB Leitura 7000MB/s', 'Eletrônicos', 780.00, 25),
('prod-110', 'Webcam 4K Ultra HD com Microfone', 'Eletrônicos', 520.00, 18)
ON CONFLICT (id) DO NOTHING;

-- 2. VESTUÁRIO (10 Itens - prod-201 a prod-210)
INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
('prod-201', 'Camiseta Algodão Egípcio Premium', 'Vestuário', 119.90, 40),
('prod-202', 'Calça Jeans Slim Fit Stretch', 'Vestuário', 189.00, 25),
('prod-203', 'Jaqueta de Couro SINTÉTICO Moto', 'Vestuário', 350.00, 10),
('prod-204', 'Moletom Canguru Oversized com Capuz', 'Vestuário', 159.90, 30),
('prod-205', 'Tênis Running Performance Pro', 'Vestuário', 499.00, 14),
('prod-206', 'Bermuda Masc Cargo Ripstop', 'Vestuário', 129.00, 18),
('prod-207', 'Vestido Midi Elegante Casual', 'Vestuário', 210.00, 15),
('prod-208', 'Camisa Social Manga Longa Slim', 'Vestuário', 169.90, 0), -- [TESTE ESTOQUE ZERADO]
('prod-209', 'Meia Esportiva Kit c/ 3 Pares', 'Vestuário', 39.90, 60),
('prod-210', 'Cinto de Couro Legítimo', 'Vestuário', 89.90, 22)
ON CONFLICT (id) DO NOTHING;

-- 3. ELETRODOMÉSTICOS (10 Itens - prod-301 a prod-310)
INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
('prod-301', 'Geladeira Frost Free 450L Inverter', 'Eletrodomésticos', 3899.00, 6),
('prod-302', 'Máquina de Lavar Roupa 13kg Smart', 'Eletrodomésticos', 2499.00, 9),
('prod-303', 'Fritadeira Air Fryer Digital 5.5L', 'Eletrodomésticos', 399.90, 30),
('prod-304', 'Micro-ondas 30L Espelhado', 'Eletrodomésticos', 650.00, 12),
('prod-305', 'Aspirador de Pó Robô Wi-Fi Mop', 'Eletrodomésticos', 1190.00, 8),
('prod-306', 'Cafeteira Expresso Automática', 'Eletrodomésticos', 890.00, 10),
('prod-307', 'Liquidificador Inox 1200W', 'Eletrodomésticos', 199.90, 20),
('prod-308', 'Ar Condicionado Split Inverter 12000 BTU', 'Eletrodomésticos', 2199.00, 4),
('prod-309', 'Ventilador de Coluna Silencioso', 'Eletrodomésticos', 189.90, 15),
('prod-310', 'Batedeira Planetária 5L Inox', 'Eletrodomésticos', 320.00, 0) -- [TESTE ESTOQUE ZERADO]
ON CONFLICT (id) DO NOTHING;

-- 4. PERFUMARIA (10 Itens - prod-401 a prod-410)
INSERT INTO produtos (id, nome, categoria, preco, estoque) VALUES
('prod-401', 'Perfume Importado Eau de Parfum 100ml', 'Perfumaria', 580.00, 12),
('prod-402', 'Perfume Amadeirado Intenso 100ml', 'Perfumaria', 240.00, 20),
('prod-403', 'Colônia Floral Fresca 200ml', 'Perfumaria', 110.00, 25),
('prod-404', 'Sérum Facial Anti-idade Ácido Hialurônico', 'Perfumaria', 145.00, 18),
('prod-405', 'Creme Hidratante Corporal 400ml', 'Perfumaria', 68.00, 35),
('prod-406', 'Protetor Solar Facial FPS 60', 'Perfumaria', 79.90, 40),
('prod-407', 'Kit Shampoos & Condicionador Nutrição', 'Perfumaria', 125.00, 16),
('prod-408', 'Óleo Capilar Reparador de Pontas 100ml', 'Perfumaria', 95.00, 22),
('prod-409', 'Perfume Oriental Especiado 50ml', 'Perfumaria', 310.00, 10),
('prod-410', 'Bálsamo Pós-Barba Hidratante', 'Perfumaria', 55.00, 0) -- [TESTE ESTOQUE ZERADO]
ON CONFLICT (id) DO NOTHING;