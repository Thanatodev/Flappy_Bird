// Função para criar elementos HTML
function novoElemento(tagName, className) {
  const elem = document.createElement(tagName);
  elem.className = className;
  return elem;
}

// Função que verifica se houve colisão entre dois elementos
function colidiu(elementoA, elementoB) {
  const a = elementoA.getBoundingClientRect();
  const b = elementoB.getBoundingClientRect();

  return (
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
  );
}

// Construtor do pássaro
class Passaro {
  constructor(alturaJogo) {
    this.voando = false;

    this.elemento = novoElemento("div", "pássaro");
    const img = novoElemento("img", "passaro");
    img.src = "imagens/passaro.png";
    this.elemento.appendChild(img);

    this.getY = () => parseInt(this.elemento.style.top.split("px")[0]);
    this.setY = (y) => (this.elemento.style.top = `${y}px`);

    // Constantes para gravidade e voo
    const GRAVIDADE = 5;
    const VOO = 7;

    // Controla a gravidade e o voo
    window.addEventListener("keydown", () => (this.voando = true));
    window.addEventListener("keyup", () => (this.voando = false));

    this.animar = () => {
      const novoY = this.getY() + (this.voando ? -VOO : GRAVIDADE);
      const alturaMaxima = alturaJogo - this.elemento.clientHeight;

      if (novoY <= 0) {
        this.setY(0);
      } else if (novoY >= alturaMaxima) {
        this.setY(alturaMaxima);
      } else {
        this.setY(novoY);
      }
    };
    this.setY(alturaJogo / 2);
  }
}

// Construtor de cada cano separado
class Cano {
  constructor(reverse = false) {
    this.elemento = novoElemento("div", "Cano");
    const borda = novoElemento("div", "borda");
    const corpo = novoElemento("div", "corpo");
    this.elemento.appendChild(reverse ? corpo : borda);
    this.elemento.appendChild(reverse ? borda : corpo);
    this.setAltura = (altura) => (corpo.style.height = `${altura}px`);
  }
}

// Construtor do par de canos
class Canos {
  constructor(altura, abertura, x) {
    this.elemento = novoElemento("div", "canos");
    this.cima = new Cano(true);
    this.baixo = new Cano(false);
    this.elemento.appendChild(this.cima.elemento);
    this.elemento.appendChild(this.baixo.elemento);

    this.abertura = function () {
      const alturaCima = Math.random() * (altura - abertura);
      const alturaBaixo = altura - abertura - alturaCima;
      this.cima.setAltura(alturaCima);
      this.baixo.setAltura(alturaBaixo);
    };

    this.getX = () => parseInt(this.elemento.style.left.split("px")[0]);
    this.setX = (x) => (this.elemento.style.left = `${x}px`);
    this.getLargura = () => this.elemento.clientWidth;

    this.abertura();
    this.setX(x);
  }
}

// Função que cria os canos e gera a animação de passar os canos
class Gameplay {
  constructor(altura, largura, abertura, espaco, pontuacaoCallback) {
    this.pares = [
      new Canos(altura, abertura, largura),
      new Canos(altura, abertura, largura + espaco),
      new Canos(altura, abertura, largura + espaco * 2),
      new Canos(altura, abertura, largura + espaco * 3),
    ];
    const deslocamento = 3;
    this.pontuacao = 0; // Adiciona uma variável de pontuação

    this.animar = () => {
      this.pares.forEach((par) => {
        par.setX(par.getX() - deslocamento);
        // Verifica se os canos saíram da tela e reposiciona eles
        if (par.getX() < -par.getLargura()) {
          par.setX(espaco * this.pares.length);
          par.abertura();
        }
        const ponto = largura / 5;
        const marcouPonto =
          par.getX() + deslocamento >= ponto && par.getX() < ponto;
        if (marcouPonto) {
          this.pontuacao++; // Incrementa a pontuação conforme a passagem dos canos
          pontuacaoCallback(this.pontuacao);
        }
      });
    };
  }
}

// Função para exibir a mensagem de Game Over
// Coloquei o estilo do gameover aqui por que ficou mais fácil por estar criando o elemento dentro do script
// do reiniciar coloquei no css pq foi mais chato
function gameOver() {
  const reiniciar = novoElemento("button", "reiniciar");
  reiniciar.innerText = "Reiniciar";
  reiniciar.onclick = () => {
    location.reload();
  };
  const gameOverElement = document.createElement("div");
  gameOverElement.style.position = "absolute";
  gameOverElement.style.top = "50%";
  gameOverElement.style.left = "50%";
  gameOverElement.style.transform = "translate(-50%, -50%)";
  gameOverElement.style.fontSize = "40px";
  gameOverElement.style.color = "white";
  gameOverElement.innerHTML = "Game Over!";
  document.body.appendChild(gameOverElement);
  document.body.appendChild(reiniciar);
}

// Função para exibir a tela inicial
function telaInicial() {
  const telaInicialElement = novoElemento("div", "tela-inicial");
  const titulo = document.createElement("h1");
  titulo.innerText = "Flappy Bird";

  const botaoIniciar = novoElemento("button", "iniciar");
  botaoIniciar.innerText = "Iniciar";
  botaoIniciar.onclick = () => {
    document.body.removeChild(telaInicialElement); // Remove a tela inicial
    iniciarJogo(); // Inicia o jogo
  };

  telaInicialElement.appendChild(titulo);
  telaInicialElement.appendChild(botaoIniciar);
  document.body.appendChild(telaInicialElement);
}

// Função para iniciar o jogo
function iniciarJogo() {
  const areaDeJogo = document.querySelector("[flappy]");
  const altura = 500;
  const largura = 800;

  // Adicionando o pássaro
  const passaro = new Passaro(altura);
  areaDeJogo.appendChild(passaro.elemento);

  // Criando um elemento para exibir a pontuação
  //sobre o estilo, mesma coisa do gameover
  const pontuacaoElement = novoElemento("div", "pontuacao");
  pontuacaoElement.innerText = "Pontuação: 0";
  areaDeJogo.appendChild(pontuacaoElement);
  pontuacaoElement.style.position = "absolute";
  pontuacaoElement.style.top = "10px";
  pontuacaoElement.style.right = "10px";
  pontuacaoElement.style.zIndex = "1";
  pontuacaoElement.style.fontSize = "24px";
  pontuacaoElement.style.fontWeight = "bold";
  pontuacaoElement.style.color = "white";

  // Criando os canos
  const canos = new Gameplay(altura, largura, 200, 400, (novaPontuacao) => {
    pontuacaoElement.innerText = `Pontuação: ${novaPontuacao}`; // Atualiza a pontuação na tela
  });
  canos.pares.forEach((par) => areaDeJogo.appendChild(par.elemento));

  // Função principal que anima o jogo e verifica colisões
  let jogoRodando = true;
  const intervalo = setInterval(() => {
    if (jogoRodando) {
      canos.animar();
      passaro.animar();

      canos.pares.forEach((par) => {
        if (
          colidiu(passaro.elemento, par.cima.elemento) ||
          colidiu(passaro.elemento, par.baixo.elemento)
        ) {
          jogoRodando = false;
          gameOver();
          clearInterval(intervalo);
        }
      });
    }
  }, 20);
}
// Iniciar o jogo
telaInicial();
