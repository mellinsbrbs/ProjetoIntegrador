
const conexao = require("../db.js");

async function listarProdutos() {
    const [produtos] = await conexao.query(
        "SELECT * FROM produtos WHERE ativo = 1"
    );

    return produtos;
}

module.exports = { listarProdutos };
