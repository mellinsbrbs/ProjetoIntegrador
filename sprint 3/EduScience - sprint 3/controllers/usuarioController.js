
const usuarioModel = require("../models/usuarioModel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function cadastrar(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha || senha.length < 6) {
        return res.status(400).json({
            erro: "Preencha os dados. A senha precisa ter 6 caracteres."
        });
    }

    try {
        const senha_hash = await bcrypt.hash(senha, 10);

        await usuarioModel.cadastrarUsuario(nome, email, senha_hash);

        res.json({
            mensagem: "Cadastro realizado!"
        });

    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                erro: "E-mail já cadastrado."
            });
        }

        console.log(erro);
        res.status(500).json({
            erro: "Erro no cadastro."
        });
    }
}

async function login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: "Preencha e-mail e senha."
        });
    }

    try {
        const usuario = await usuarioModel.buscarUsuario(email);

        if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
            return res.status(401).json({
                erro: "E-mail ou senha incorretos."
            });
        }

        const token = jwt.sign(
            { id_usuario: usuario.id_usuario },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({
            mensagem: "Login realizado!",
            nome: usuario.nome,
            token
        });

    } catch (erro) {
        console.log(erro);
        res.status(500).json({
            erro: "Erro no login."
        });
    }
}

module.exports = { cadastrar, login };
