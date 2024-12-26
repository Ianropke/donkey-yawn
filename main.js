// main.js

// Vores spilkonfiguration
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', // ID fra index.html
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let platforms;
let barrels;
let music;
let jumpSound;

function preload() {
  // Indlæs dine assets (eksempler):
  //  - Sprites
  this.load.image('platform', 'assets/sprites/platform.png');
  this.load.image('barrel', 'assets/sprites/barrel.png');
  this.load.spritesheet('player', 'assets/sprites/player.png', {
    frameWidth: 32,
    frameHeight: 48
  });

  //  - Lyd
  this.load.audio('music', 'assets/audio/music.mp3');
  this.load.audio('jump', 'assets/audio/jump.wav');
}

function create() {
  // Start background music
  music = this.sound.add('music', { loop: true, volume: 0.3 });
  music.play();

  jumpSound = this.sound.add('jump', { volume: 0.5 });

  // Opret stationære platforme
  platforms = this.physics.add.staticGroup();
  // Bundplatform
  platforms.create(400, 590, 'platform').setScale(2, 1).refreshBody();
  // Lidt tilfældige platforme i "Donkey Kong"-stil
  platforms.create(600, 450, 'platform');
  platforms.create(200, 350, 'platform');
  platforms.create(400, 250, 'platform');

  // Spiller
  player = this.physics.add.sprite(100, 500, 'player');
  player.setCollideWorldBounds(true);

  // Collider mellem spiller og platforme
  this.physics.add.collider(player, platforms);

  // Animer spilleren (du skal have rammer i player.png)
  this.anims.create({
    key: 'left',
    frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });
  this.anims.create({
    key: 'turn',
    frames: [ { key: 'player', frame: 4 } ],
    frameRate: 20
  });
  this.anims.create({
    key: 'right',
    frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
    frameRate: 10,
    repeat: -1
  });

  // Input
  cursors = this.input.keyboard.createCursorKeys();

  // Tønder (barrels)
  barrels = this.physics.add.group({
    key: 'barrel',
    repeat: 2,
    setXY: { x: 700, y: 100, stepX: 70 }
  });
  barrels.children.iterate((barrel) => {
    barrel.setBounce(0.2);
    barrel.setCollideWorldBounds(true);
    // Giv dem et tilfældigt skub
    barrel.setVelocityX(Phaser.Math.Between(-100, -200));
  });

  // Collider mellem tønder og platforme
  this.physics.add.collider(barrels, platforms);

  // Hvis spiller rører tønder, dør han (forenklet)
  this.physics.add.overlap(player, barrels, hitBarrel, null, this);
}

function update() {
  // Spiller-bevægelse
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play('left', true);
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play('right', true);
  } else {
    player.setVelocityX(0);
    player.anims.play('turn');
  }

  // Hop
  if (cursors.up.isDown && player.body.touching.down) {
    player.setVelocityY(-400);
    jumpSound.play();
  }
}

// Simpel kollisions-funktion:
function hitBarrel(player, barrel) {
  // For eksempel: Genstart scenen
  this.scene.restart();
  // Eller fjern liv, eller vis game over
}
