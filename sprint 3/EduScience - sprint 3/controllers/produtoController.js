
const produtoModel = require("../models/produtoModel.js");

async function listarProdutos(req, res) {
    try {
        const produtos = await produtoModel.listarProdutos();
        res.json(produtos);
    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro ao buscar produtos."
        });
    }
}

module.exports = { listarProdutos };
