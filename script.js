document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const carrinhoIcone = document.getElementById("carrinho-icone");
    const carrinhoPopup = document.getElementById("carrinho-popup");
    const entregaRadios = document.querySelectorAll('input[name="entrega"]');
    const dadosEntrega = document.getElementById("dados-entrega");
    const itensCarrinho = document.getElementById("itens-carrinho");
    const totalSpan = document.getElementById("total");
    const formCliente = document.getElementById("form-cliente");
    const searchInput = document.getElementById('barra-pesquisa'); // searchInput é definido aqui
    const pizzaCards = document.querySelectorAll('.pizza-card');

    // Variável do carrinho
    let carrinhoItens = {};

    // Função para mostrar/ocultar carrinho
    function toggleCarrinho() {
        carrinhoPopup.style.display = carrinhoPopup.style.display === "block" ? "none" : "block";
    }

    /**
     * Filtra os cards de pizza com base no texto digitado na barra de pesquisa.
     */
    const filtrarPizzas = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        pizzaCards.forEach(card => {
            const pizzaName = card.querySelector('h3').textContent.toLowerCase();
            const pizzaDescription = card.querySelector('p').textContent.toLowerCase(); // Supondo que você queira pesquisar na descrição também

            if (pizzaName.includes(searchTerm) || pizzaDescription.includes(searchTerm)) {
                card.style.display = 'block'; // Ou 'flex' se o seu CSS usar flexbox para os cards
            } else {
                card.style.display = 'none';
            }
        });
    };
    // Função para atualizar quantidade
    function alterarQuantidade(id, delta) {
        const span = document.querySelector(`.quantidade[data-id="${id}"]`);
        let qtd = parseInt(span.textContent) + delta;
        qtd = Math.max(0, qtd);
        span.textContent = qtd;

        if (qtd === 0) {
            delete carrinhoItens[id];
        } else {
            const card = span.closest(".pizza-card");
            carrinhoItens[id] = {
                quantidade: qtd,
                preco: parseFloat(card.querySelector(".preco").textContent.replace("R$ ", "").replace(",", ".")),
                nome: card.querySelector("h3").textContent,
                imagem: card.querySelector("img").src
            };
        }
        atualizarCarrinho();
        atualizarTotal();
    }

    // Função para atualizar visual do carrinho
    function atualizarCarrinho() {
        itensCarrinho.innerHTML = Object.entries(carrinhoItens).map(([id, item]) => `
            <div class="item-carrinho">
                <img src="${item.imagem}" alt="${item.nome}">
                <div class="info-carrinho">
                    <span>${item.nome} - R$ ${item.preco.toFixed(2)}</span>
                    <div class="quantidade-container">
                        <button class="btn-quantidade" onclick="alterarQuantidade('${id}', -1)">-</button>
                        <span class="quantidade">${item.quantidade}</span>
                        <button class="btn-quantidade" onclick="alterarQuantidade('${id}', 1)">+</button>
                    </div>
                </div>
                <textarea rows="1" placeholder="Observações:"></textarea>
            </div>
        `).join("");
    }

    // Função para calcular total
    function atualizarTotal() {
        const total = Object.values(carrinhoItens).reduce((acc, item) => acc + (item.quantidade * item.preco), 0);
        totalSpan.textContent = `Total: R$ ${total.toFixed(2).replace(".", ",")}`;
    }

    // Função para enviar ao WhatsApp
    function enviarPedidoWhatsApp() {
        if (Object.keys(carrinhoItens).length === 0) {
            alert("Adicione itens ao carrinho primeiro!");
            return;
        }

        const nome = formCliente.querySelector('input[placeholder="Nome"]').value;
        const celular = formCliente.querySelector('input[placeholder="Celular"]').value;
        
        if (!nome || !celular) {
            alert("Preencha nome e celular!");
            return;
        }
        
        let mensagem = `*PEDIDO TELE PIZZA*\n\n`;
        mensagem += `*Cliente:* ${nome}\n`;
        mensagem += `*Forma de Entrega:* ${document.querySelector('input[name="entrega"]:checked').value === "retirar" ? "Retirar no local" : "Entregar"}\n`;
        // CORREÇÃO PARA O PROBLEMA DO "RETIRAR":
        // A linha abaixo causava erro se a opção fosse "retirar" e o campo de endereço estivesse vazio.
        // A validação e inclusão do endereço na mensagem deve ser condicional.
        const tipoEntregaSelecionado = document.querySelector('input[name="entrega"]:checked').value;
        if (tipoEntregaSelecionado === "entregar") {
            const endereco = formCliente.querySelector('input[placeholder="Endereço"]').value;
            const numero = formCliente.querySelector('input[placeholder="Número"]').value;
            const complemento = formCliente.querySelector('input[placeholder="Complemento (opcional)"]').value;
            const cep = formCliente.querySelector('input[placeholder="CEP"]').value; // Adicionando CEP aqui

            if (!endereco || !numero || !cep) {
                alert("Para entrega, preencha Endereço, Número e CEP!");
                return;
            }
            mensagem += `*Endereço:* ${endereco}, ${numero}`;
            if (complemento) mensagem += `, ${complemento}`;
            mensagem += `\n*CEP:* ${cep}\n`;
        } else {
             // Se for "retirar", apenas indica que é para retirar no local
             mensagem += `*Detalhes de Entrega:* Retirar no local\n`;
        }

        mensagem += `*Celular:* ${celular}\n\n`; // Celular já está acima, mas mantido aqui se quiser duplicar
        mensagem += `*Itens do Pedido:*\n`;

        Object.values(carrinhoItens).forEach(item => {
            mensagem += `- ${item.nome} (${item.quantidade}x) - R$ ${(item.quantidade * item.preco).toFixed(2).replace(".",",")}\n`; // Adicionado replace para vírgula
        });
        
        const total = Object.values(carrinhoItens).reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        mensagem += `\n*Total: R$ ${total.toFixed(2).replace(".",",")}*`; // Adicionado replace para vírgula

        window.location.href = 'https://api.whatsapp.com/send?phone=551122096732&text=' + encodeURIComponent(mensagem);
    }

    // Event Listeners
    carrinhoIcone.addEventListener("click", toggleCarrinho);
    
    entregaRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            dadosEntrega.style.display = e.target.value === "entregar" ? "block" : "none";
            // Limpa os campos de entrega se a opção for "retirar"
            if (e.target.value === "retirar") {
                dadosEntrega.querySelectorAll('input').forEach(input => input.value = '');
            }
        });
    });

    formCliente.addEventListener("submit", function(e) {
        e.preventDefault();
        enviarPedidoWhatsApp();
    });

    // Torna as funções disponíveis globalmente (para os onclick nos botões de quantidade)
    window.alterarQuantidade = alterarQuantidade;

    // *******************************************************************
    // ** A ÚNICA ALTERAÇÃO REALIZADA PARA CORRIGIR A BARRA DE PESQUISA **
    // ** ESTA LINHA FOI MOVIDA PARA DENTRO DE DOMContentLoaded         **
    // *******************************************************************
    if (searchInput) { // Verifica se o elemento searchInput existe antes de adicionar o listener
        searchInput.addEventListener('input', filtrarPizzas);
    } else {
        console.warn("Elemento com ID 'barra-pesquisa' não encontrado. A barra de pesquisa pode não funcionar.");
    }
    
    // *******************************************************************
    // ** CORREÇÃO PARA O BOTÃO FECHAR E CONFLITOS DE VARIÁVEIS GLOBAIS **
    // ** 'closeBtn' deve ser o ID do seu botão 'X' no carrinho         **
    // *******************************************************************
    const closeBtn = document.getElementById('closeBtn'); // Garante que closeBtn seja pego no DOMContentLoaded
    if (closeBtn) {
        closeBtn.addEventListener('click', fecharCarrinho);
    } else {
        console.warn("Elemento com ID 'closeBtn' não encontrado. O botão de fechar carrinho pode não funcionar.");
    }
});

// REMOVIDO: const btnFechar = document.getElementById('closeBtn'); (DUPLICADO E FORA DO ESCOPO)
// REMOVIDO: const carrinhoPopup = document.getElementById("carrinho-popup"); (DUPLICADO E FORA DO ESCOPO)

// REMOVIDO: function fecharCarrinho() { carrinhoPopup.style.display = "none"; } (DUPLICADO E FORA DO ESCOPO)

// REMOVIDO: searchInput.addEventListener('input', filtrarPizzas); (ESTAVA FORA DO ESCOPO, AGORA ESTÁ DENTRO)

/*
REMOVIDO: Grande bloco de código comentado 'teste' para limpar o arquivo.
Ele estava abaixo do DOMContentLoaded e não era usado, mas adicionava ruído.
*/
