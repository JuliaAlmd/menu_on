
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const carrinhoIcone = document.getElementById("carrinho-icone");
    const carrinhoPopup = document.getElementById("carrinho-popup");
    const entregaRadios = document.querySelectorAll('input[name="entrega"]');
    const dadosEntrega = document.getElementById("dados-entrega");
    const itensCarrinho = document.getElementById("itens-carrinho");
    const totalSpan = document.getElementById("total");
    const formCliente = document.getElementById("form-cliente");
    const searchInput = document.getElementById('barra-pesquisa');
    const pizzaCards = document.querySelectorAll('.pizza-card'); 


    // Variável do carrinho
    let carrinhoItens = {};

    // Função para mostrar/ocultar carrinho
    function toggleCarrinho() {
        carrinhoPopup.style.display = carrinhoPopup.style.display === "block" ? "none" : "block";
    }


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
    mensagem += `*Endereço:* ${document.querySelector('input[placeholder="Endereço"]').value}\n`;
    mensagem += `*Celular:* ${celular}\n\n`;
    mensagem += `*Itens do Pedido:*\n`;

    Object.values(carrinhoItens).forEach(item => {
        mensagem += `- ${item.nome} (${item.quantidade}x) - R$ ${(item.quantidade * item.preco).toFixed(2)}\n`;
    });
    
    const total = Object.values(carrinhoItens).reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
    mensagem += `\n*Total: R$ ${total.toFixed(2)}*`;


        window.location.href = 'https://api.whatsapp.com/send?phone=551122096732&text=' + encodeURIComponent(mensagem);
    }

    // Event Listeners
    carrinhoIcone.addEventListener("click", toggleCarrinho);
    
    entregaRadios.forEach(radio => {
        radio.addEventListener("change", (e) => {
            dadosEntrega.style.display = e.target.value === "entregar" ? "block" : "none";
        });
    });

    formCliente.addEventListener("submit", function(e) {
        e.preventDefault();
        enviarPedidoWhatsApp();
    });

    // Torna as funções disponíveis globalmente (para os onclick nos botões de quantidade)
    window.alterarQuantidade = alterarQuantidade;
});

const btnFechar = document.getElementById('closeBtn');
const carrinhoPopup = document.getElementById("carrinho-popup");


 function fecharCarrinho() {
    carrinhoPopup.style.display = "none";
 }

/ Filtra as pizzas em tempo real ao digitar na barra de pesquisa
    searchInput.addEventListener('input', filtrarPizzas); // 'input' é mais robusto que 'keyup'

/*

    teste

const btnFechar = document.getElementById('btn-fechar-carrinho');
    const carrinho = document.getElementById('carrinho-popup');

    // Funções atualizadas
    function abrirCarrinho() {
        carrinho.classList.add('show');
    }

    function fecharCarrinho() {
        carrinho.classList.remove('show');
    }

    function toggleCarrinho() {
        carrinho.classList.toggle('show');
    }

    // Event listeners
    carrinhoIcone.addEventListener('click', function(e) {
        e.stopPropagation();
        abrirCarrinho();
    });

    btnFechar.addEventListener('click', function(e) {
        e.stopPropagation();
        fecharCarrinho();
    });

    document.addEventListener('click', function(e) {
        if (!carrinho.contains(e.target) && e.target !== carrinhoIcone) {
            fecharCarrinho();
        }
    });

*/
