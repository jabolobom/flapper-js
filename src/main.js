import kaplay from "kaplay";

const k = kaplay({
    width: window.screen.width * 0.5,
    height: window.screen.height * 0.5,
    canvas: document.getElementById("canvas"), 
});

k.setLayers(["bg", "obj", "ui"], "obj")


const mainfont = k.loadFont("VCR", "fonts/VCR_OSD_MONO_1.001.ttf")
k.loadSound("jump1", "sounds/JUMP1-F.wav") // TODO find a way to use both randomly, dont want to use it if elses
k.loadSound("jump2", "sounds/JUMP2-G.wav") // but it may be inevitable
k.loadSound("hit", "sounds/HIT-F#.wav") // not working atm, the other scene overwrites it, maybe a "game over"
// theme to play after hitting something

k.scene("game_over", ({ score }) => {

        const middleX = k.width() / 2;
        const middleY = k.height() / 2;

        k.add([
        k.text(`Game Over`, { size: 64, font: mainfont,}),
        k.color(255,0,0),
        pos(middleX, middleY-64),
        k.anchor("center"), // that is useful
        k.layer("ui"), 
        ])

        k.add([
        k.text(`Final Score: ${score}`, { size: 32, font: mainfont,}),
        pos(middleX, middleY),
        k.anchor("center"), // that is useful
        k.layer("ui"), 
        ])

        k.add([
        k.text(`Press SPACE to start again.`, { size: 32, font: mainfont,}),
        pos(middleX, middleY+64),
        k.anchor("center"), // that is useful
        k.layer("ui"), 
        ])

        k.onKeyPress(["space", "z"], () =>{
            k.go("main")
        })
})

k.scene("main", () => {

    k.setBackground(50, 200, 235)
    
    // config
    let vertical_speed = 0;
    const gravity = 1200;
    const middleX = k.width() / 2;
    const middleY = k.height() / 2;
    let paused = false;
    let started = false;
    let restart = false; // TODO
    let score = 0;

    const pipeGap = 140;

    // player and pipes
    const bird = k.add([
        k.rect(32,32),
        k.pos(middleX, middleY),
        k.area(),
        k.color(255, 255, 0),
        k.layer("obj"),
        "player",
    ]);
         
    // jumping
    k.onKeyPress(["space", "z"], () => { 
        started = true;
        k.play("jump1")
        vertical_speed = -450;
    })

    const scoreCounter = k.add([
        k.text(`Score: ${score}`, { size: 32, font: mainfont,}),
        pos(middleX, 64),
        k.anchor("center"), // that is useful
        k.layer("ui"),
    ])


    function spawnPipe(){

    const gapCenter = k.rand(pipeGap, k.height() - pipeGap);
    const pipeX = k.width() + 64; // offscreen

    k.add([
        k.rect(64, k.height()),
        k.pos(pipeX, gapCenter + pipeGap / 2),
        k.area(),
        k.color(0,0,255),
        "pipe",
        { passed: false },
        k.layer("obj"),
    ]);

    k.add([
        k.rect(64, k.height()),
        k.pos(pipeX, gapCenter - pipeGap / 2 - k.height()), 
        k.area(),
        k.color(0,200,0),
        "pipe",
        k.layer("obj"),
    ]); // dont actually need to return anything, there's no reference needed to each individual pipe
    // refering them all together through the tag "pipe" works fine
    };

    function gameOver(lastscore){
        k.go("game_over", {score: lastscore})

        return;
    }


    // game logic
    k.onUpdate(() => {
        
        // "gravity"
        if (!paused && started){
        vertical_speed += gravity * k.dt();
        bird.pos.y += vertical_speed * k.dt();
        }
       
        // bound check
        if (bird.pos.y > k.height())
        {
            bird.pos.y = k.height(); 
            vertical_speed = 0; 
            paused = true;
            gameOver(score);
        }
        if (bird.pos.y < 0){ bird.pos.y = 0; vertical_speed = 0; }

        // bird tilt
        // something about // if (vertical speed > tilt_threshold && bird.rotation < y) {bird.rotation += x;}

    })

    // pipe spawning
    k.loop(1.2, () => { // don't know if the original was like this, but this looks fine
        if (!paused && started) { spawnPipe(); }
    })
    
    // pipe movement
    k.onUpdate("pipe" , (pipe) => { // batch referencing all "pipe"s to move left
        if (!paused && started){  
            pipe.move(-220,0 * k.dt())
            if (pipe.pos.x < -64){
                k.destroy(pipe);
            }

            if (pipe.pos.x < bird.pos.x && !pipe.passed){ // this actually check for the one who actually has the flag
                pipe.passed = true; // and the one who doesn't (who will also return false lol)
                score += 0.5; // i mean, i could fix this, but this also works so...
                scoreCounter.text = `Score: ${score}`;
            }}
    })

    // collisions
    k.onCollide("player", "pipe", () =>{
        paused = true;
        gameOver(score); // TODO: figure it out how to reset the scene
    })
    
});



k.go("main");