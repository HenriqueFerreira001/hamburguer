// script.js - Arquivo JavaScript para funcionalidades do site da hamburgueria

// Inicializando o carrinho, carregando do localStorage se existir
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Função para mostrar toast de notificação
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000); // Desaparece após 3 segundos
}


const produtos = document.querySelectorAll('.produto');
const imagemGrande = document.getElementById('imagemGrande');

produtos.forEach(produto => {
    produto.addEventListener('click', () => {
        imagemGrande.src = produto.src;
    });
});



// Função para filtrar itens do cardápio
function filterMenu() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const menuItems = document.querySelectorAll('.menu-grid li');
    menuItems.forEach(item => {
        const itemName = item.querySelector('h3').textContent.toLowerCase();
        const itemDesc = item.querySelector('p').textContent.toLowerCase();
        if (itemName.includes(searchTerm) || itemDesc.includes(searchTerm)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Função para adicionar um item ao carrinho
function addToCart(itemName, itemPrice, itemImageSrc) {
    // Verifica se o item já está no carrinho
    const existingItem = cart.find(item => item.name === itemName);
    if (existingItem) {
        // Se já existe, aumenta a quantidade
        existingItem.quantity += 1;
    } else {
        // Se não, adiciona novo item
        cart.push({ name: itemName, price: itemPrice, imageSrc: itemImageSrc, quantity: 1 });
    }
    // Atualiza a exibição do carrinho
    updateCartDisplay();
    // Mostra notificação
    showToast(`${itemName} adicionado ao carrinho!`);
}

// Função para remover um item do carrinho
function removeFromCart(itemName) {
    // Encontra o item e diminui a quantidade ou remove se for 1
    const itemIndex = cart.findIndex(item => item.name === itemName);
    if (itemIndex > -1) {
        if (cart[itemIndex].quantity > 1) {
            cart[itemIndex].quantity -= 1;
        } else {
            cart.splice(itemIndex, 1);
        }
    }
    updateCartDisplay();
}

// Função para calcular o total do carrinho
function calculateTotal() {
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const deliveryMethod = document.getElementById('delivery-method')?.value;
    if (deliveryMethod === 'entrega') {
        subtotal += 5.00; // Taxa de entrega
    }
    return subtotal;
}

// Função para atualizar a exibição do carrinho (por enquanto, no console; depois podemos adicionar uma seção no HTML)
function updateCartDisplay() {
    console.log('Carrinho atualizado:', cart);
    console.log('Total: R$', calculateTotal().toFixed(2));
    // Salvar no localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    // Atualizar contador de itens no header
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    // Atualizar modal se estiver aberto
    updateModalDisplay();
}

// Função para atualizar o conteúdo do modal
function updateModalDisplay() {
    const cartItemsList = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItemsList.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="item-info">
                <img src="${item.imageSrc}" alt="${item.name}" class="item-image">
                <div>
                    <strong>${item.name}</strong><br>
                    <small>${item.quantity}x R$ ${(item.price * item.quantity).toFixed(2)}</small>
                </div>
            </div>
            <button class="remove-btn" data-name="${item.name}" title="Remover item">🗑️</button>
        `;
        cartItemsList.appendChild(li);
    });
    cartTotal.textContent = `Total: R$ ${calculateTotal().toFixed(2)}`;
    // Adicionar event listeners aos botões de remover
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemName = e.target.getAttribute('data-name');
            removeFromCart(itemName);
        });
    });
    // Event listener para recalcular total ao mudar método de entrega
    const deliverySelect = document.getElementById('delivery-method');
    deliverySelect.addEventListener('change', () => {
        cartTotal.textContent = `Total: R$ ${calculateTotal().toFixed(2)}`;
    });
}

// Função para gerar mensagem de pedido para WhatsApp
function generateOrderMessage() {
    if (cart.length === 0) {
        return 'Carrinho vazio!';
    }
    const deliveryMethod = document.getElementById('delivery-method').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    let message = 'Olá, gostaria de fazer um pedido:\n';
    cart.forEach(item => {
        message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `Método: ${deliveryMethod === 'entrega' ? 'Entrega' : 'Retirada'}\n`;
    if (deliveryMethod === 'entrega') {
        message += `Endereço: ${address}\nTaxa de entrega: R$ 5.00\n`;
    }
    message += `Telefone: ${phone}\n`;
    message += `Total: R$ ${calculateTotal().toFixed(2)}\nObrigado!`;
    return message;
}

// Função para enviar pedido via WhatsApp (abre o WhatsApp com a mensagem)
function sendOrderViaWhatsApp() {
    const phone = document.getElementById('phone').value;
    const deliveryMethod = document.getElementById('delivery-method').value;
    const address = document.getElementById('address').value;
    if (!phone) {
        alert('Por favor, informe seu telefone.');
        return;
    }
    if (deliveryMethod === 'entrega' && !address) {
        alert('Por favor, informe o endereço para entrega.');
        return;
    }
    const message = encodeURIComponent(generateOrderMessage());
    const phoneNumber = '5511976724548'; // Substitua pelo número real da hamburgueria
    const url = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(url, '_blank');
    // Confirmação de pedido
    alert('Pedido enviado com sucesso! Aguarde confirmação via WhatsApp.');
    // Limpar carrinho após pedido
    cart = [];
    updateCartDisplay();
    closeCartModal();
}

// Função para abrir o modal do carrinho
function openCartModal() {

    console.log('Abrindo modal do carrinho');
    const modal = document.getElementById('cart-modal');
    console.log('Modal element:', modal);
    modal.style.cssText = 'display: flex !important; align-items: center; justify-content: center; position: fixed; z-index: 9999; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); top: 0; left: 0;';
    updateModalDisplay();
    document.body.classList.add("no-scroll");

}

// Função para fechar o modal
function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.style.display = 'none';
    document.body.classList.remove("no-scroll");

}

// Exemplo de uso: adicionar event listeners aos botões "Pedir" no HTML
// Isso será feito no final do arquivo ou em uma função init

// Função para animações de fade-in no scroll
function fadeInOnScroll() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            element.classList.add('visible');
        }
    });
}

// Mapa de imagens por produto
const productImageMap = {
    "Hamburguer Com Alface e Tomate": [
        "https://images.unsplash.com/photo-1610970878459-a0e464d7592b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGFtYnVyZ2VyfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    "burguer classico": [
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1610970878459-a0e464d7592b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGFtYnVyZ2VyfGVufDB8fDB8fHww"
    ],
    "Cheese Burguer": [
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?q=80&w=1115&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1610970878459-a0e464d7592b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aGFtYnVyZ2VyfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ],
    "batata frita": [
        "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmF0YXRhJTIwZnJpdGF8ZW58MHx8MHx8fDA%3D",
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsa3NoYWtlfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWlsa3NoYWtlfGVufDB8fHx8fA%3D%3D"
    ],
    "Biscoito de chocolate frappe": [
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsa3NoYWtlfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWlsa3NoYWtlfGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmF0YXRhJTIwZnJpdGF8ZW58MHx8MHx8fDA%3D"
    ],
    "Caneca recheada de creme e Chocolate": [
        "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bWlsa3NoYWtlfGVufDB8fHx8fA%3D%3D",
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWlsa3NoYWtlfGVufDB8fDB8fHww",
        "https://images.unsplash.com/photo-1528751014936-863e6e7a319c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmF0YXRhJTIwZnJpdGF8ZW58MHx8MHx8fDA%3D"
    ]
};

let currentProductImages = [];
let currentImageIndex = 0;

// Função para abrir o sidebar
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add('open');
}

// Função para fechar o sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('open');
    closeBtn.addEventListener("click", () => {
        cartModal.style.display = "none";
        document.body.classList.remove("no-scroll");
    });

}

// Função para abrir o modal do produto
function openProductModal(itemName, itemPrice, itemImageSrc, itemDescription) {
    const modal = document.getElementById('product-modal');
    document.getElementById('product-name').textContent = itemName;
    document.getElementById('product-price').textContent = itemPrice;
    document.getElementById('product-description').textContent = itemDescription;
    currentProductImages = productImageMap[itemName] || [itemImageSrc];
    currentImageIndex = '3';
    document.getElementById('product-image').src = currentProductImages[currentImageIndex];
    // Esconder setas se só uma imagem
    const navButtons = document.querySelectorAll('.image-nav');
    if (currentProductImages.length <= 1) {
        navButtons.forEach(btn => btn.style.display = 'none');
    } else {
        navButtons.forEach(btn => btn.style.display = 'block');
    }
    modal.style.display = 'flex';
    // Event listener para o botão adicionar ao carrinho
    document.getElementById('add-to-cart-btn').onclick = () => {
        addToCart(itemName, parseFloat(itemPrice.replace('$', '').replace(',', '.')), itemImageSrc);
        closeProductModal();
    };
}

// Função para fechar o modal do produto
function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.style.display = 'none';
}

// Função para mudar imagem no slider
function changeImage(direction) {
    if (currentProductImages.length <= 1) return; // Não navegar se só uma imagem
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = currentProductImages.length - 1;
    if (currentImageIndex >= currentProductImages.length) currentImageIndex = 0;
    document.getElementById('product-image').src = currentProductImages[currentImageIndex];
}

// Função de inicialização (chamada quando a página carrega)
function init() {
    // Adicionar event listeners aos botões de pedido
    const orderButtons = document.querySelectorAll('.btn[href=""]'); // Seleciona botões "Pedir" vazios
    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Pegar nome e preço do item (assumindo que estão próximos no HTML)
            const itemElement = button.closest('li');
            const isSidebar = itemElement.closest('#sidebar');
            let itemName, itemPriceText;
            if (isSidebar) {
                itemName = itemElement.querySelector('strong').textContent;
                itemPriceText = itemElement.querySelector('span').textContent;
            } else {
                itemName = itemElement.querySelector('h3').textContent;
                itemPriceText = itemElement.querySelector('strong').textContent;
            }
            const itemPrice = parseFloat(itemPriceText.replace('$', '').replace(',', '.'));
            const itemImageSrc = itemElement.querySelector('img').src;
            addToCart(itemName, itemPrice, itemImageSrc);
            // Fechar sidebar se for do sidebar
            if (itemElement.closest('#sidebar')) {
                closeSidebar();
            }
        });
    });

    // Adicionar event listeners aos itens do menu para abrir modal de produto
    const menuItems = document.querySelectorAll('.menu-grid li');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Evitar abrir se clicar no botão "Pedir"
            if (e.target.classList.contains('btn')) return;
            const itemName = item.querySelector('h3').textContent;
            const itemPrice = item.querySelector('strong').textContent;
            const itemImageSrc = item.querySelector('img').src;
            const itemDescription = item.querySelector('p').textContent;
            openProductModal(itemName, itemPrice, itemImageSrc, itemDescription);
        });
    });

    // Adicionar event listener ao contador do carrinho para abrir modal
    const cartInfo = document.querySelector('.cart-info');
    cartInfo.addEventListener('click', openCartModal);

    // Event listeners para o modal
    const closeBtn = document.querySelector('.close');
    closeBtn.addEventListener('click', closeCartModal);

    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('cart-modal');
        if (e.target === modal) {
            closeCartModal();
        }
    });

    // Adicionar botão para enviar pedido (pode ser um novo botão no HTML)
    const checkoutBtn = document.getElementById('checkout-btn');
    checkoutBtn.addEventListener('click', sendOrderViaWhatsApp);

    // Fechar modal do produto ao clicar fora
    window.addEventListener('click', (e) => {
        const productModal = document.getElementById('product-modal');
        if (e.target === productModal) {
            closeProductModal();
        }
    });

    // Atualizar display inicial
    updateCartDisplay();

    // Adicionar event listener para animações de scroll
    window.addEventListener('scroll', fadeInOnScroll);
    // Chamar uma vez para elementos já visíveis
    fadeInOnScroll();

    // Adicionar event listener para busca
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterMenu);

    // Fechar sidebar ao clicar fora
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuBtn = document.querySelector('.menu-btn');
        document.addEventListener("click", function (e) {
            const cartModal = document.getElementById("cart-modal");
            const cartContent = document.getElementById("cart-content");

            // 🔒 Blindagem TOTAL
            if (!cartModal || !cartContent) return;

            if (
                cartModal.style.display === "flex" &&
                !cartContent.contains(e.target)
            ) {
                closeCartModal();
            }
        });

    });
}

const checkoutBtn = document.getElementById("checkout-btn");

checkoutBtn.addEventListener("click", () => {
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const deliveryMethod = document.getElementById("delivery-method").value;

    const paymentSelected = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    if (!phone) return;
    if (deliveryMethod === "entrega" && !address) return;
    if (!paymentSelected) return;

    const paymentMethod = paymentSelected.value;

    // 🔹 DEFINE TEXTO DO PAGAMENTO
    let paymentText = "";

    if (paymentMethod === "pix") {
        paymentText = "💸 Pix";
    }

    if (paymentMethod === "dinheiro") {
        const changeValue = document.getElementById("change")?.value;
        paymentText = changeValue
            ? `💵 Dinheiro (Troco para R$ ${changeValue})`
            : "💵 Dinheiro (Sem troco)";
    }

    if (paymentMethod === "cartao") {
        const selectedCard = document.querySelector(
            'input[name="cardType"]:checked'
        );

        if (!selectedCard) return;

        paymentText =
            selectedCard.value === "debito"
                ? "💳 Cartão Débito"
                : "💳 Cartão Crédito";
    }

    // 🔹 ITENS DO CARRINHO
    let itemsMessage = "";
    const cartItems = document.querySelectorAll("#cart-items li");

    cartItems.forEach((item, index) => {
        const name = item.querySelector("strong")?.innerText || "Produto";
        itemsMessage += `\n${index + 1}. ${name}`;
    });

    const total = document.getElementById("cart-total").innerText;

    const deliveryText =
        deliveryMethod === "entrega"
            ? `🚚 Entrega\n📍 Endereço: ${address}`
            : "🏪 Retirada no local";

    // 🔹 MENSAGEM FINAL WHATSAPP
    const message = `
🍔 *NOVO PEDIDO* 🍔

🛒 *Pedido:*
${itemsMessage}

${total}

${deliveryText}

💳 *Pagamento:* ${paymentText}

📞 *Telefone:* ${phone}
`;

    const whatsappNumber = "5511999999999"; // SEU NÚMERO
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
    )}`;

    window.open(whatsappURL, "_blank");

    closeCartModal();
});


function mostrarErro(texto) {
    const errorMsg = document.getElementById("form-error");
    errorMsg.innerText = texto;
    errorMsg.style.display = "block";
}

document.addEventListener("click", function (e) {
    const cartModal = document.getElementById("cart-modal");

    if (cartModal) {
        cartModal.classList.remove("active");
    }

});
const paymentRadios = document.querySelectorAll(
    'input[name="paymentMethod"]'
);
const changeContainer = document.getElementById("change-container");

paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.value === "dinheiro") {
            changeContainer.style.display = "block";
        } else {
            changeContainer.style.display = "none";
        }
    });
});
const pixContainer = document.getElementById("pix-container");
const copyPixBtn = document.getElementById("copy-pix");
const pixKeyInput = document.getElementById("pix-key");

paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.value === "pix") {
            pixContainer.style.display = "block";
        } else {
            pixContainer.style.display = "none";
        }
    });
});

/* Copiar Pix */
copyPixBtn.addEventListener("click", () => {
    pixKeyInput.select();
    pixKeyInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(pixKeyInput.value);

    copyPixBtn.innerText = "✅ Pix copiado!";
    setTimeout(() => {
        copyPixBtn.innerText = "📋 Copiar Pix";
    }, 2000);
});
const cardTypeContainer = document.getElementById("card-type-container");
const cardTypeRadios = document.querySelectorAll(
    'input[name="cardType"]'
);

paymentRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
        if (radio.value === "cartao") {
            cardTypeContainer.style.display = "block";
        } else {
            cardTypeContainer.style.display = "none";

            cardTypeRadios.forEach((r) => (r.checked = false));
        }
    });
});
let cardTypeText = "";
const paymentMethod = document.querySelector(
    'input[name="paymentMethod"]:checked'
)?.value;

if (paymentMethod === "cartao") {
    const selectedCard = document.querySelector(
        'input[name="cardType"]:checked'
    );

    if (!selectedCard) {
        alert("Escolha Débito ou Crédito.");
        // return;

    }

    cardTypeText =
        selectedCard.value === "debito"
            ? "💳 Cartão Débito"
            : "💳 Cartão Crédito";

}
function openSidebar() {
    // função adicionada apenas para evitar erro
}


document.addEventListener("click", function (e) {
    const cartModal = document.getElementById("cart-modal");
    const cartContent = document.getElementById("cart-content");

    if (!cartModal || !cartContent) return;

    if (
        cartModal.style.display === "flex" &&
        !cartContent.contains(e.target)
    ) {
        closeCartModal();
    }
});





// Chamar init quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);