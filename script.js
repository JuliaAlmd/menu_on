document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const carrinhoIcone = document.getElementById("carrinho-icone");
    const carrinhoPopup = document.getElementById("carrinho-popup");
    const entregaRadios = document.querySelectorAll('input[name="entrega"]');
    const dadosEntrega = document.getElementById("dados-entrega");
    const itensCarrinho = document.getElementById("itens-carrinho");
    const totalSpan = document.getElementById("total");
    const formCliente = document.getElementById("form-cliente");
    // Seleciona a barra de pesquisa pelo ID (certifique-se de que o input HTML tenha este ID)
    const searchInput = document.getElementById('barra-pesquisa');
    // Seleciona todos os cards de pizza
    const pizzaCards = document.querySelectorAll('.pizza-card'); 


    // Variável do carrinho
    let carrinhoItens = {};

    // Função para mostrar/ocultar carrinho (usando classes para animação)
    function toggleCarrinho() {
        carrinhoPopup.classList.toggle('show');
    }

    // Função para fechar o carrinho (para o botão 'X')
    function fecharCarrinho() {
        carrinhoPopup.classList.remove('show');
    }

    /* Filtra os cards de pizza com base no texto digitado na barra de pesquisa.
     */
    const filtrarPizzas = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();

        pizzaCards.forEach(card => {
            const pizzaName = card.querySelector('h3').textContent.toLowerCase();
            const pizzaDescription = card.querySelector('p') ? card.querySelector('p').textContent.toLowerCase() : ''; // Adicionado verificação para descrição, caso não exista
            
            // Verifica se o termo de pesquisa está no nome ou na descrição da pizza
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
                // Garante que o preço seja um número e substitui vírgula por ponto para parseFloat
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
                    <span>${item.nome} - R$ ${item.preco.toFixed(2).replace(".", ",")}</span>
                    <div class="quantidade-container">
                        <button class="btn-quantidade" onclick="alterarQuantidade('${id}', -1)">-</button>
                        <span class="quantidade" data-id="${id}">${item.quantidade}</span>
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
        // Adiciona endereço somente se a entrega for "entregar"
        if (document.querySelector('input[name="entrega"]:checked').value === "entregar") {
            const cep = formCliente.querySelector('input[placeholder="CEP"]').value;
            const endereco = formCliente.querySelector('input[placeholder="Endereço"]').value;
            const numero = formCliente.querySelector('input[placeholder="Número"]').value;
            const complemento = formCliente.querySelector('input[placeholder="Complemento (opcional)"]').value;

            mensagem += `*CEP:* ${cep}\n`;
            mensagem += `*Endereço:* ${endereco}, ${numero} ${complemento ? `- ${complemento}` : ''}\n`;
        }
        mensagem += `*Celular:* ${celular}\n\n`;
        mensagem += `*Itens do Pedido:*\n`;

        Object.values(carrinhoItens).forEach(item => {
            mensagem += `- ${item.nome} (${item.quantidade}x) - R$ ${(item.quantidade * item.preco).toFixed(2).replace(".", ",")}\n`;
            // Adicionar observações específicas do item, se houver
            const obsTextarea = document.querySelector(`.item-carrinho .quantidade[data-id="${item.id}"]`).closest('.item-carrinho').querySelector('textarea');
            if (obsTextarea && obsTextarea.value.trim() !== '') {
                mensagem += `  (Obs: ${obsTextarea.value.trim()})\n`;
            }
        });
        
        const observacoesGerais = document.getElementById('observacoes').value;
        if (observacoesGerais.trim() !== '') {
            mensagem += `\n*Observações Gerais:* ${observacoesGerais.trim()}\n`;
        }

        const total = Object.values(carrinhoItens).reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
        mensagem += `\n*Total: R$ ${total.toFixed(2).replace(".", ",")}*`;


        window.open('https://api.whatsapp.com/send?phone=551122096732&text=' + encodeURIComponent(mensagem), '_blank');
    }

    // Event Listeners
    carrinhoIcone.addEventListener("click", toggleCarrinho);
    
    // Event listener para o botão de fechar o carrinho
    document.getElementById('closeBtn').addEventListener('click', fecharCarrinho);

    entregaRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            dadosEntrega.style.display = e.target.value === "entregar" ? "block" : "none";
            // Define os campos de endereço como "required" apenas se a entrega for selecionada
            const enderecoInputs = dadosEntrega.querySelectorAll('input');
            enderecoInputs.forEach(input => {
                input.required = (e.target.value === "entregar");
            });
        });
    });

    formCliente.addEventListener("submit", function(e) {
        e.preventDefault();
        enviarPedidoWhatsApp();
    });

    // Adiciona o event listener para a barra de pesquisa
    if (searchInput) {
        searchInput.addEventListener('input', filtrarPizzas);
    }

    // Torna as funções disponíveis globalmente (para os onclick nos botões de quantidade)
    window.alterarQuantidade = alterarQuantidade;
    window.fecharCarrinho = fecharCarrinho; // Garante que fecharCarrinho está global
});
