let carrinho =
JSON.parse(localStorage.getItem('carrinho'))
|| [];

let toastTimeout;

// A promoção vale para o pedido inteiro: com 2 ou mais brownies,
// cada unidade passa a custar R$ 10,00.
const QUANTIDADE_MINIMA_DESCONTO = 2;
const PRECO_COM_DESCONTO = 10;

function obterPrecoDoCarrinho(){

  const quantidadeTotal = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  const descontoAtivo = quantidadeTotal >= QUANTIDADE_MINIMA_DESCONTO;

  return {
    quantidadeTotal,
    descontoAtivo
  };
}

function obterPrecoUnitario(item, descontoAtivo){

  return descontoAtivo ? PRECO_COM_DESCONTO : item.preco;
}

function calcularTotalDoPedido(){

  const { descontoAtivo } = obterPrecoDoCarrinho();

  return carrinho.reduce(
    (total, item) => total + obterPrecoUnitario(item, descontoAtivo) * item.quantidade,
    0
  );
}

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

  const { quantidadeTotal, descontoAtivo } = obterPrecoDoCarrinho();

  carrinho.forEach(item => {

    const subtotal =
    obterPrecoUnitario(item, descontoAtivo) * item.quantidade;

    total += subtotal;

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

  contador.innerText = quantidadeTotal;

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

  const totalElement = document.getElementById('payment-total');
  const modal = document.getElementById('payment-modal');

  totalElement.innerText = `R$ ${calcularTotalDoPedido().toFixed(2)}`;
  modal.hidden = false;
  return;

  let mensagem =
  'Olá, quero fazer um pedido:%0A%0A';

  let total = 0;

  const { descontoAtivo } = obterPrecoDoCarrinho();

  carrinho.forEach(item => {

    const subtotal =
    obterPrecoUnitario(item, descontoAtivo) * item.quantidade;

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

function fecharPagamento(){

  document.getElementById('payment-modal').hidden = true;
}

function copiarChavePix(){

  const chavePix = '100.798.222-58';

  if(navigator.clipboard && navigator.clipboard.writeText){

    navigator.clipboard.writeText(chavePix)
    .then(() => mostrarToast('Chave Pix copiada!'))
    .catch(() => copiarChavePixAlternativa(chavePix));

    return;
  }

  copiarChavePixAlternativa(chavePix);
}

function copiarChavePixAlternativa(chavePix){

  const campoTemporario = document.createElement('textarea');
  campoTemporario.value = chavePix;
  document.body.appendChild(campoTemporario);
  campoTemporario.select();
  document.execCommand('copy');
  campoTemporario.remove();
  mostrarToast('Chave Pix copiada!');
}

function enviarPedidoWhatsApp(){

  const { descontoAtivo } = obterPrecoDoCarrinho();
  let mensagem = 'Olá, quero fazer um pedido:\n\n';

  carrinho.forEach(item => {

    const subtotal = obterPrecoUnitario(item, descontoAtivo) * item.quantidade;

    mensagem += `🍫 ${item.nome}\nQuantidade: ${item.quantidade}\nSubtotal: R$ ${subtotal.toFixed(2)}\n\n`;
  });

  mensagem += `🛒 Total: R$ ${calcularTotalDoPedido().toFixed(2)}\n\nPagamento Pix realizado.`;

  window.open(
    `https://wa.me/5591985982706?text=${encodeURIComponent(mensagem)}`,
    '_blank'
  );

  carrinho = [];
  fecharPagamento();
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
