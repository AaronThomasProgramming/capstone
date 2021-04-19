const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(config)

// Player and player settings
let player
const pMoveVel = 160
const pJumpVel = -330

let platforms
let bombs
let cursors

// Score text and score text settings
let scoreText
let score = 0

function preload() {
    // Preloading resources used by the game
    this.load.image('sky', './resources/sky.png')
    this.load.image('ground', './resources/platform.png')
    this.load.image('star', './resources/star.png')
    this.load.image('bomb', './resources/bomb.png')
    this.load.spritesheet('dude', './resources/dude.png', { frameWidth: 32, frameHeight: 48 })
}

function create() {
    // Add sky background to our screen
    this.add.image(400, 300, 'sky')

    // Add sprite representing our player. Set a bounce and add collider to stay on screen
    player = this.physics.add.sprite(100, 450, 'dude')
    player.setBounce(0.2)
    player.setCollideWorldBounds(true)

    // Add group that will hold our platforms.
    // Add a ground to the game and 3 platforms the player can jump up to.
    platforms = this.physics.add.staticGroup()
    platforms.create(400, 568, 'ground').setScale(2).refreshBody()
    platforms.create(600, 400, 'ground')
    platforms.create(50, 250, 'ground')
    platforms.create(750, 220, 'ground')

    // Add group that will hold our bombs.
    bombs = this.physics.add.group()

    // Add cursor keys to be used for player movement.
    cursors = this.input.keyboard.createCursorKeys()

    // Initialize the score text that will show in the top left of the screen.
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' })

    // Create an animation that will play when the left key is held.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    })

    // Create an animation that will play when no key is held.
    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    })

    // Create an animation that will play when the right key is held.
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    })

    // Add group to hold our stars.
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    })

    // Iterate over all stars and add a bounce to them.
    stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))
    })

    // All colliders between player, platforms, stars and bombs.
    this.physics.add.collider(player, platforms)
    this.physics.add.collider(stars, platforms)
    this.physics.add.collider(bombs, platforms)
    this.physics.add.collider(player, bombs, hitBomb, null, this)

    // When the player overlaps with a star, run collectStar function.
    this.physics.add.overlap(player, stars, collectStar, null, this)
}

function update() {
    // Conditionals for player movement and changing animations.
    if (cursors.left.isDown) {
        player.setVelocityX(-pMoveVel)
        player.anims.play('left', true)
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(pMoveVel)
        player.anims.play('right', true)
    }
    else {
        player.setVelocityX(0)
        player.anims.play('turn')
    }

    // Conditional for player jump.
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(pJumpVel)
    }
}

function collectStar(player, star) {
    star.disableBody(true, true)

    score += 10
    scoreText.setText(`Score: ${score}`)

    // When all stars have been collected create more and add a bomb that bounces around the screen.
    if (stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true)
        })

        let x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400)

        let bomb = bombs.create(x, 16, 'bomb')
        bomb.setBounce(1)
        bomb.setCollideWorldBounds(true)
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20)
    }
}

// When the player touches a bomb pause game, make player red and reset player animation.
function hitBomb(player, bomb) {
    this.physics.pause()

    player.setTint(0xff0000)
    player.anims.play('turn')
}