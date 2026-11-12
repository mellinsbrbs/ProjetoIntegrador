
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const conexao = require("./db.js");
const produtoController = require("./controllers/produtoController.js");
const usuarioController = require("./controllers/usuarioController.js");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

if (!process.env.JWT_SECRET) {
    throw new Error("Configure JWT_SECRET no arquivo .env");
}

// Página inicial
app.get("/", (req, res) => {
    res.send("API EduScience funcionando!");
});

// Produtos
app.get("/produtos", produtoController.listarProdutos);

// Cadastro e login
app.post("/cadastro", usuarioController.cadastrar);
app.post("/login", usuarioController.login);

// Verificar se o usuário está logado
function autenticar(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        const usuario = jwt.verify(token, process.env.JWT_SECRET);
        req.id_usuario = usuario.id_usuario;
        next();

    } catch (erro) {
        res.status(401).json({
            erro: "Faça login novamente."
        });
    }
}

// Buscar carrinho aberto
async function buscarCarrinho(id_usuario) {
    const [carrinhos] = await conexao.query(
        `SELECT id_carrinho FROM carrinhos
         WHERE id_usuario = ? AND status = 'aberto'
         ORDER BY id_carrinho DESC LIMIT 1`,
        [id_usuario]
    );

    return carrinhos[0];
}

// Mostrar carrinho
app.get("/carrinho", autenticar, async (req, res) => {
    try {
        const carrinho = await buscarCarrinho(req.id_usuario);

        if (!carrinho) {
            return res.json({
                itens: [],
                total: 0
            });
        }

        const [itens] = await conexao.query(
            `SELECT i.id_item, i.id_produto, i.quantidade,
                    p.nome, p.preco, p.estoque,
                    (i.quantidade * p.preco) AS subtotal
             FROM itens_carrinho i
             JOIN produtos p ON p.id_produto = i.id_produto
             WHERE i.id_carrinho = ?`,
            [carrinho.id_carrinho]
        );

        const total = itens.reduce(
            (soma, item) => soma + Number(item.subtotal),
            0
        );

        res.json({
            itens,
            total
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao buscar carrinho."
        });
    }
});

// Adicionar produto ao carrinho
app.post("/carrinho", autenticar, async (req, res) => {
    const id_produto = Number(req.body.id_produto);

    if (!Number.isInteger(id_produto) || id_produto <= 0) {
        return res.status(400).json({
            erro: "Produto inválido."
        });
    }

    let db;

    try {
        db = await conexao.getConnection();
        await db.beginTransaction();

        const [produtos] = await db.query(
            `SELECT estoque FROM produtos
             WHERE id_produto = ? AND ativo = 1`,
            [id_produto]
        );

        if (!produtos.length) {
            await db.rollback();
            return res.status(404).json({
                erro: "Produto não encontrado."
            });
        }

        const [carrinhos] = await db.query(
            `SELECT id_carrinho FROM carrinhos
             WHERE id_usuario = ? AND status = 'aberto'
             ORDER BY id_carrinho DESC LIMIT 1 FOR UPDATE`,
            [req.id_usuario]
        );

        let id_carrinho = carrinhos[0]?.id_carrinho;

        if (!id_carrinho) {
            const [novo] = await db.query(
                "INSERT INTO carrinhos (id_usuario) VALUES (?)",
                [req.id_usuario]
            );

            id_carrinho = novo.insertId;
        }

        const [itens] = await db.query(
            `SELECT id_item, quantidade FROM itens_carrinho
             WHERE id_carrinho = ? AND id_produto = ?
             FOR UPDATE`,
            [id_carrinho, id_produto]
        );

        const quantidade = (itens[0]?.quantidade || 0) + 1;

        if (quantidade > produtos[0].estoque) {
            await db.rollback();
            return res.status(400).json({
                erro: "Estoque insuficiente."
            });
        }

        if (itens.length) {
            await db.query(
                `UPDATE itens_carrinho SET quantidade = ?
                 WHERE id_item = ?`,
                [quantidade, itens[0].id_item]
            );
        } else {
            await db.query(
                `INSERT INTO itens_carrinho
                 (id_carrinho, id_produto, quantidade)
                 VALUES (?, ?, 1)`,
                [id_carrinho, id_produto]
            );
        }

        await db.commit();

        res.json({
            mensagem: "Produto adicionado ao carrinho!"
        });

    } catch (erro) {
        if (db) await db.rollback();

        console.error(erro);

        res.status(500).json({
            erro: "Erro ao adicionar produto."
        });

    } finally {
        if (db) db.release();
    }
});

// Alterar quantidade do produto
app.put("/carrinho/:id", autenticar, async (req, res) => {
    const id = Number(req.params.id);
    const quantidade = Number(req.body.quantidade);

    if (!Number.isInteger(id) || id <= 0 ||
        !Number.isInteger(quantidade) || quantidade < 1) {
        return res.status(400).json({
            erro: "Quantidade inválida."
        });
    }

    try {
        const [itens] = await conexao.query(
            `SELECT i.id_item, p.estoque
             FROM itens_carrinho i
             JOIN carrinhos c ON c.id_carrinho = i.id_carrinho
             JOIN produtos p ON p.id_produto = i.id_produto
             WHERE i.id_item = ?
             AND c.id_usuario = ?
             AND c.status = 'aberto'`,
            [id, req.id_usuario]
        );

        if (!itens.length) {
            return res.status(404).json({
                erro: "Item não encontrado."
            });
        }

        if (quantidade > itens[0].estoque) {
            return res.status(400).json({
                erro: "Estoque insuficiente."
            });
        }

        await conexao.query(
            "UPDATE itens_carrinho SET quantidade = ? WHERE id_item = ?",
            [quantidade, id]
        );

        res.json({
            mensagem: "Quantidade atualizada!"
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao atualizar item."
        });
    }
});

// Remover produto do carrinho
app.delete("/carrinho/:id", autenticar, async (req, res) => {
    try {
        const [resultado] = await conexao.query(
            `DELETE i FROM itens_carrinho i
             JOIN carrinhos c ON c.id_carrinho = i.id_carrinho
             WHERE i.id_item = ?
             AND c.id_usuario = ?
             AND c.status = 'aberto'`,
            [req.params.id, req.id_usuario]
        );

        if (!resultado.affectedRows) {
            return res.status(404).json({
                erro: "Item não encontrado."
            });
        }

        res.json({
            mensagem: "Produto removido!"
        });

    } catch (erro) {
        console.error(erro);

        res.status(500).json({
            erro: "Erro ao remover item."
        });
    }
});

// Finalizar compra
app.post("/finalizar-compra", autenticar, async (req, res) => {
    let db;

    try {
        db = await conexao.getConnection();
        await db.beginTransaction();

        // Buscar carrinho
        const [carrinhos] = await db.query(
            `SELECT id_carrinho FROM carrinhos
             WHERE id_usuario = ? AND status = 'aberto'
             ORDER BY id_carrinho DESC LIMIT 1 FOR UPDATE`,
            [req.id_usuario]
        );

        if (carrinhos.length === 0) {
            await db.rollback();

            return res.status(400).json({
                erro: "Seu carrinho está vazio."
            });
        }

        const id_carrinho = carrinhos[0].id_carrinho;

        // Buscar itens do carrinho
        const [itens] = await db.query(
            `SELECT i.id_produto, i.quantidade,
                    p.nome, p.preco, p.estoque, p.ativo
             FROM itens_carrinho i
             JOIN produtos p ON p.id_produto = i.id_produto
             WHERE i.id_carrinho = ?
             ORDER BY i.id_produto
             FOR UPDATE`,
            [id_carrinho]
        );

        if (itens.length === 0) {
            await db.rollback();

            return res.status(400).json({
                erro: "Seu carrinho está vazio."
            });
        }

        // Verificar estoque e calcular total
        let totalCentavos = 0;

        for (const item of itens) {
            if (!item.ativo ||
                item.quantidade < 1 ||
                item.quantidade > item.estoque) {

                await db.rollback();

                return res.status(400).json({
                    erro: `Produto indisponível ou estoque insuficiente: ${item.nome}`
                });
            }

            totalCentavos +=
                Math.round(Number(item.preco) * 100) * item.quantidade;
        }

        const total = totalCentavos / 100;

        // Registrar venda
        const [venda] = await db.query(
            `INSERT INTO vendas
             (id_usuario, valor_total, status)
             VALUES (?, ?, 'pendente')`,
            [req.id_usuario, total]
        );

        const id_venda = venda.insertId;

        // Registrar produtos vendidos
        for (const item of itens) {
            await db.query(
                `INSERT INTO itens_venda
                 (id_venda, id_produto, quantidade, preco_unitario)
                 VALUES (?, ?, ?, ?)`,
                [
                    id_venda,
                    item.id_produto,
                    item.quantidade,
                    item.preco
                ]
            );

            // Atualizar estoque
            const [resultado] = await db.query(
                `UPDATE produtos
                 SET estoque = estoque - ?
                 WHERE id_produto = ?
                 AND estoque >= ? AND ativo = 1`,
                [
                    item.quantidade,
                    item.id_produto,
                    item.quantidade
                ]
            );

            if (resultado.affectedRows === 0) {
                throw new Error("Estoque insuficiente.");
            }
        }

        // Registrar nota fiscal em rascunho
        const numero = `EDU-${id_venda}`;

        await db.query(
            `INSERT INTO notas_fiscais
             (id_venda, numero, status)
             VALUES (?, ?, 'rascunho')`,
            [id_venda, numero]
        );

        // Limpar carrinho
        await db.query(
            "DELETE FROM itens_carrinho WHERE id_carrinho = ?",
            [id_carrinho]
        );

        // Marcar carrinho como finalizado
        await db.query(
            `UPDATE carrinhos
             SET status = 'finalizado'
             WHERE id_carrinho = ?`,
            [id_carrinho]
        );

        await db.commit();

        res.status(201).json({
            mensagem: "Pedido registrado com sucesso!",
            id_venda,
            total
        });

    } catch (erro) {
        if (db) await db.rollback();

        console.error(erro);

        res.status(500).json({
            erro: "Não foi possível finalizar o pedido."
        });

    } finally {
        if (db) db.release();
    }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
