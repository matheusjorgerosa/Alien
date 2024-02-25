// São definidas as constantes de Largura e Altura do Jogo.
const larguraJogo = 700;
const alturaJogo = 850;

// Define as configurações do jogo como tipo do jogo, largura, altura e cenas.
const config = {
    type: Phaser.AUTO,
    width: larguraJogo,
    height: alturaJogo,

    // Adiciona física no jogo
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: true
        }
    },

    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

// Define a constante "game" e a ela é atribuida um novo jogo com os parâmetros de configuração
const game = new Phaser.Game(config);

// Declaração de variáveis
var alien;
var teclado;
var moeda;
var fogo;
var placar;
var pontuacao = 0;
var plataforma1;
var plataforma2;
var recordes = [0];
var novoRecorde;
var posicaoPlataforma_X;
var posicaoPlataforma_Y;
var segundos = 0;

// Função de pré-carregamento das imagens
function preload() {
    this.load.image('background', 'assets/bg.png');
    this.load.image('player', 'assets/alienigena.png');
    this.load.image('turbo_nave', 'assets/turbo.png');
    this.load.image('plataforma1', 'assets/tijolos.png');
    this.load.image('plataforma2', 'assets/tijolos.png');
    this.load.image('moeda', 'assets/moeda.png');
}

function create() {

    // Adiciona o plano de fundo no centro da tela (metade da largura e altura)
    this.add.image(larguraJogo/2, alturaJogo/2, 'background');

    // Adiciona o fogo do turbo e o define como invisível
    fogo = this.add.sprite(0, 0, 'turbo_nave');
    fogo.setVisible(false);

    // Adiciona o alien com física aplicada e define suas colisões com o mapa
    alien = this.physics.add.sprite(larguraJogo/2, 0, 'player');
    alien.setCollideWorldBounds(true);

    // Define os inputs do teclado na variável teclado
    teclado = this.input.keyboard.createCursorKeys();

    // Cria a plataforma 1 e define colisão com o alien
    plataforma1 = this.physics.add.staticImage(larguraJogo/2, alturaJogo/2, 'plataforma1');
    this.physics.add.collider(alien, plataforma1);

    // Cria a plataforma 2 em posição aleatória e define colisão com o alien e plataforma 1
    var rand_plataformaX = Phaser.Math.RND.between(alien.width, larguraJogo - alien.width);
    var rand_plataformaY = Phaser.Math.RND.between(alien.height, alturaJogo - alien.height);
    plataforma2 = this.physics.add.sprite(rand_plataformaX, rand_plataformaY, 'plataforma2');
    // Adiciona colisão entre o alien e plataforma 2, inibindo a inércia após colisão
    this.physics.add.collider(alien, plataforma2, function() {
        alien.setVelocity(0, 0);
        plataforma2.setVelocity(0, 0);
    }, null, this);
    this.physics.add.collider(plataforma2, plataforma1);
    // Desativa a gravidade do sprite plataforma 2
    plataforma2.body.setAllowGravity(false);
    // Define colisão com as bordas do jogo
    plataforma2.setCollideWorldBounds(true);
            
    // Gera um valor randômico de x para a moeda, adiciona colisão com plataformas e cria um bounce para ela
    var rand_x = Phaser.Math.RND.between(0, larguraJogo);
    moeda = this.physics.add.sprite(rand_x, 0, 'moeda');
    moeda.setCollideWorldBounds(true);
    this.physics.add.collider(moeda, plataforma1);
    // Adiciona colisão entre o moeda e plataforma 2, inibindo a inércia após colisão
    this.physics.add.collider(moeda, plataforma2, function() {
        moeda.setVelocity(0, 0);
        plataforma2.setVelocity(0, 0);
    }, null, this);
    moeda.setBounce(0.5);

    // Adiciona o placar com a pontuação atual do jogador
    placar = this.add.text(50, 50, 'Moedas: ' + pontuacao, {fontSize: '45px', fill: "#495613"});

    // Adiciona o texto de Recorde na tela
    listaRecorde = this.add.text(400, 50, 'Sem recorde', {fontSize: '45px', fill: '#495613'});

    // Lógica para coletar moeda e somar 1 ponto à pontuação do player
    this.physics.add.overlap(alien, moeda, function() {
        moeda.setVisible(false);
        var posicaoMoeda_Y = Phaser.Math.RND.between(50, 650);
        moeda.setPosition(posicaoMoeda_Y, 100);
        pontuacao += 1;
        placar.setText('Moedas: ' + pontuacao);
        moeda.setVisible(true);
    });

    // Timer para resetar o jogo a cada 30 segundos
    setInterval(resetar, 30000);
}

function update() {

    // Faz o alien ir para esquerda quando pressionada a seta para a esquerda    
    if (teclado.left.isDown) {
        alien.setVelocityX(-250);
    }
    // Faz o alien ir para direita quando pressionada a seta para a direita
    else if (teclado.right.isDown) {
        alien.setVelocityX(250);
    }
    // Nenhum movimento na horizontal quando não há teclas horizontais pressionadas
    else {
        alien.setVelocityX(0);
    }
    // Faz o alien ir para cima quando pressionada a seta para a cima e ativa o turbo
    if (teclado.up.isDown) {
        alien.setVelocityY(-250);
        ativarTurbo();
    }
    // Desativa o turbo do alien
    else {
        semTurbo();
    }

    // Define a posição do fogo um pouco abaixo do alien
    fogo.setPosition(alien.x, alien.y + alien.height/2);
}

// Define uma função para deixar o fogo visível
function ativarTurbo() {
    fogo.setVisible(true);
}

// Define uma função para deixar o fogo invisível
function semTurbo() {
    fogo.setVisible(false);
}

// Função para resetar a pontuação e registrar recordes
function resetar() {

    for ( i = 0; recordes.length >= i; i++ ) {
        if ( pontuacao > recordes[i]  && !recordes.includes(pontuacao)) {
            if (pontuacao > recordes[recordes.length - 1]) {
                recordes.push(pontuacao);
                listaRecorde.setText('Recorde: ' + recordes[recordes.length - 1]);
                pontuacao = 0;
                placar.setText('Moedas: ' + pontuacao);
            }    
        }
        pontuacao = 0;
        placar.setText('Moedas: ' + pontuacao);
    }

    // Define outra posição aleatória para a plataforma 2
    plataforma2.setVisible(false);
    posicaoPlataforma_X = Phaser.Math.RND.between(50, 650);
    posicaoPlataforma_Y = Phaser.Math.RND.between(50, 650);
    plataforma2.setPosition(posicaoPlataforma_X, posicaoPlataforma_Y);
    plataforma2.setVisible(true);
}