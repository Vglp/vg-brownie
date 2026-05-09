function pedir(produto){

  const numero = "5591985982706";

  const mensagem =
   `Olá, quero pedir ${produto}`;

  const url =
  `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

  window.open(url, "_blank");
}