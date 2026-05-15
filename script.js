let carrinho =
JSON.parse(localStorage.getItem('carrinho'))
|| [];

let toastTimeout;

function adicionarCarrinho(nome, preco){

  const itemExistente =
  carrinho.find(item => item.nome === nome);

  if(itemExistente){

    itemExistente.quantidade += 1;

  } else {

    carrinho.push({
      nome,
      preco,
      quantidade:1
    });
  }

  atualizarCarrinho();

  mostrarToast(`${nome} adicionado! 🍫 Olhe seu carrinho 🛒`);

  if(navigator.vibrate){

    navigator.vibrate(100);
  }
}

function removerItem(nome){

  carrinho =
  carrinho.filter(item => item.nome !== nome);

  atualizarCarrinho();
}

function alterarQuantidade(nome, tipo){

  const item =
  carrinho.find(item => item.nome === nome);

  if(!item) return;

  if(tipo === 'mais'){

    item.quantidade++;

  } else {

    item.quantidade--;

    if(item.quantidade <= 0){

      removerItem(nome);

      return;
    }
  }

  atualizarCarrinho();
}

function atualizarCarrinho(){

  const cartItems =
  document.getElementById('cart-items');

  const totalElement =
  document.getElementById('cart-total');

  const contador =
  document.getElementById('contador-carrinho');

  cartItems.innerHTML = '';

  let total = 0;

  let totalItens = 0;

  carrinho.forEach(item => {

    const subtotal =
    item.preco * item.quantidade;

    total += subtotal;

    totalItens += item.quantidade;

    cartItems.innerHTML += `

      <div class="cart-item">

        <div>

          <p>${item.nome}</p>

          <div class="quantidade-box">

            <button onclick="alterarQuantidade('${item.nome}','menos')">
              -
            </button>

            <span>${item.quantidade}</span>

            <button onclick="alterarQuantidade('${item.nome}','mais')">
              +
            </button>

          </div>

        </div>

        <div class="cart-right">

          <span>
            R$ ${subtotal.toFixed(2)}
          </span>

          <button
            class="remove-btn"
            onclick="removerItem('${item.nome}')"
          >
            ✕
          </button>

        </div>

      </div>
    `;
  });

  totalElement.innerText =
  `R$ ${total.toFixed(2)}`;

  contador.innerText = totalItens;

  contador.animate(

    [
      { transform:'scale(1)' },
      { transform:'scale(1.3)' },
      { transform:'scale(1)' }

    ],

    {
      duration:300
    }
  );

  localStorage.setItem(
    'carrinho',
    JSON.stringify(carrinho)
  );
}

function finalizarPedido(){

  if(carrinho.length === 0){

    alert('Seu carrinho está vazio!');

    return;
  }

  let mensagem =
  'Olá, quero fazer um pedido:%0A%0A';

  let total = 0;

  carrinho.forEach(item => {

    const subtotal =
    item.preco * item.quantidade;

    mensagem +=
    `🍫 ${item.nome}%0AQuantidade: ${item.quantidade}%0ASubtotal: R$ ${subtotal.toFixed(2)}%0A%0A`;

    total += subtotal;
  });

  mensagem +=
  `%0A🛒 Total: R$ ${total.toFixed(2)}`;

  const numero =
  '5591985982706';

  const url =
  `https://wa.me/${numero}?text=${mensagem}`;

  window.open(url, '_blank');

  carrinho = [];

  atualizarCarrinho();
}

function mostrarToast(texto){

  const toast =
  document.getElementById('toast');

  if(!toast){
    console.log('Toast não encontrado');
    return;
  }

  toast.innerHTML = texto;

  toast.style.opacity = '1';

  toast.style.top = '30px';

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {

    toast.style.opacity = '0';

    toast.style.top = '-120px';

  }, 2500);
}

function toggleCart(){

  const cart =
  document.getElementById('cart');

  cart.classList.toggle('cart-fechado');
}

console.log("SCRIPT FUNCIONANDO");

atualizarCarrinho();

if('serviceWorker' in navigator){

  window.addEventListener('load', () => {

    navigator.serviceWorker
    .register('./sw.js')
    .then(() => {

      console.log('PWA funcionando');

    })
    .catch(err => {

      console.log('Erro PWA:', err);

    });

  });
}
