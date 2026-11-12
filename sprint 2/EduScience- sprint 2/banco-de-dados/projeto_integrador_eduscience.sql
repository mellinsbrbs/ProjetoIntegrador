-- EduScience - Sprint 2: copia independente do banco original
-- Execute somente no banco projeto_integrador.
CREATE DATABASE IF NOT EXISTS `projeto_integrador` CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci;
USE `projeto_integrador`;

-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           13.0.2-MariaDB - MariaDB Server
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.20.0.7320
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Copiando estrutura para tabela eduscience.carrinhos
CREATE TABLE IF NOT EXISTS `carrinhos` (
  `id_carrinho` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'aberto',
  `data_criacao` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_carrinho`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.carrinhos: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela eduscience.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(60) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.categorias: ~2 rows (aproximadamente)
INSERT INTO `categorias` (`id_categoria`, `nome`, `descricao`) VALUES
	(1, 'Quimica', 'Kits para experiencias de quimica'),
	(2, 'Fisica', 'Kits para experiencias de fisica');

-- Copiando estrutura para tabela eduscience.itens_carrinho
CREATE TABLE IF NOT EXISTS `itens_carrinho` (
  `id_item` int(11) NOT NULL AUTO_INCREMENT,
  `id_carrinho` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  PRIMARY KEY (`id_item`),
  UNIQUE KEY `id_carrinho` (`id_carrinho`,`id_produto`),
  KEY `id_produto` (`id_produto`),
  CONSTRAINT `1` FOREIGN KEY (`id_carrinho`) REFERENCES `carrinhos` (`id_carrinho`),
  CONSTRAINT `2` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`),
  CONSTRAINT `chk_quantidade_carrinho` CHECK (`quantidade` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.itens_carrinho: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela eduscience.itens_venda
CREATE TABLE IF NOT EXISTS `itens_venda` (
  `id_item` int(11) NOT NULL AUTO_INCREMENT,
  `id_venda` int(11) NOT NULL,
  `id_produto` int(11) NOT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_item`),
  KEY `id_venda` (`id_venda`),
  KEY `id_produto` (`id_produto`),
  CONSTRAINT `1` FOREIGN KEY (`id_venda`) REFERENCES `vendas` (`id_venda`),
  CONSTRAINT `2` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`),
  CONSTRAINT `chk_quantidade_venda` CHECK (`quantidade` > 0),
  CONSTRAINT `chk_preco_unitario` CHECK (`preco_unitario` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.itens_venda: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela eduscience.notas_fiscais
CREATE TABLE IF NOT EXISTS `notas_fiscais` (
  `id_nota` int(11) NOT NULL AUTO_INCREMENT,
  `id_venda` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `data_emissao` datetime DEFAULT NULL,
  `status` varchar(20) DEFAULT 'rascunho',
  PRIMARY KEY (`id_nota`),
  UNIQUE KEY `id_venda` (`id_venda`),
  UNIQUE KEY `uq_numero_nota` (`numero`),
  CONSTRAINT `1` FOREIGN KEY (`id_venda`) REFERENCES `vendas` (`id_venda`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.notas_fiscais: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela eduscience.produtos
CREATE TABLE IF NOT EXISTS `produtos` (
  `id_produto` int(11) NOT NULL AUTO_INCREMENT,
  `id_categoria` int(11) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int(11) NOT NULL DEFAULT 0,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_produto`),
  KEY `fk_produtos_categorias` (`id_categoria`),
  CONSTRAINT `fk_produtos_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `chk_produto_preco` CHECK (`preco` >= 0),
  CONSTRAINT `chk_produto_estoque` CHECK (`estoque` >= 0)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.produtos: ~5 rows (aproximadamente)
INSERT INTO `produtos` (`id_produto`, `id_categoria`, `nome`, `descricao`, `preco`, `estoque`, `ativo`) VALUES
	(1, 1, 'Kit de Quimica Basica', 'Materiais para experiencias quimicas', 89.90, 10, 1),
	(2, 1, 'Kit de Reacoes Quimicas', 'Kit para estudar reacoes quimicas', 119.90, 8, 1),
	(3, 1, 'Kit de Indicadores de pH', 'Materiais para testar o pH', 69.90, 12, 1),
	(4, 2, 'Kit de Eletricidade', 'Materiais para experiencias eletricas', 99.90, 10, 1),
	(5, 2, 'Kit de Magnetismo', 'Materiais para estudar magnetismo', 79.90, 7, 1);

-- Copiando estrutura para tabela eduscience.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `tipo` enum('cliente','administrador') NOT NULL DEFAULT 'cliente',
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `data_cadastro` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.usuarios: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela eduscience.vendas
CREATE TABLE IF NOT EXISTS `vendas` (
  `id_venda` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `data_venda` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'pendente',
  `valor_total` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id_venda`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `chk_valor_total` CHECK (`valor_total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Copiando dados para a tabela eduscience.vendas: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
