
const conexao = require("../db.js");

async function cadastrarUsuario(nome, email, senha_hash) {
    await conexao.query(
        "INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)",
        [nome, email, senha_hash]
    );
}

async function buscarUsuario(email) {
    const [usuarios] = await conexao.query(
        "SELECT * FROM usuarios WHERE email = ?",
        [email]
    );

    return usuarios[0];
}

module.exports = {
    cadastrarUsuario,
    buscarUsuario
};
