const express = require('express');
const cors = require('cors');
require('dotenv').config();

const loginRoutes = require('./routes/loginRoutes');
const carrinhoRoutes = require('./routes/carrinhoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', loginRoutes);
app.use('/api', carrinhoRoutes);

app.get('/', (req, res) => {
    res.send('Servidor do Projeto Integrador rodando com sucesso!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
