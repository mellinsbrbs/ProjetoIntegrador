
const API = "http://localhost:3000";
const token = sessionStorage.getItem("token");

async function mostrarProdutos() {
    const lista = document.getElementById("lista-produtos");

    try {
        const resposta = await fetch(`${API}/produtos`);
        const produtos = await resposta.json();

        lista.innerHTML = "";

        produtos.forEach(produto => {
            lista.innerHTML += `
                <div class="produto">
                    <h3>${produto.nome}</h3>
                    <p>${produto.descricao}</p>
                    <p>R$ ${Number(produto.preco).toFixed(2)}</p>
                    <p>Estoque: ${produto.estoque}</p>
                    <button onclick="adicionar(${produto.id_produto})">
                        Adicionar ao carrinho
                    </button>
                </div>
            `;
        });
    } catch (erro) {
        lista.textContent = "Erro ao carregar produtos.";
    }
}

async function adicionar(id_produto) {
    if (!token) {
        alert("Entre na sua conta primeiro!");
        window.location.href = "../formularios/login.html";
        return;
    }

    try {
        const resposta = await fetch(`${API}/carrinho`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id_produto })
        });

        const dados = await resposta.json();
        alert(dados.mensagem || dados.erro);

        if (resposta.status === 401) {
            sessionStorage.removeItem("token");
            window.location.href = "../formularios/login.html";
        }
    } catch (erro) {
        alert("Erro ao conectar ao servidor.");
    }
}

mostrarProdutos();
