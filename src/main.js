import kaplay from "kaplay";

const k = kaplay({
    width: window.screen.width * 0.75,
    height: window.screen.height * 0.75,
    canvas: document.getElementById("canvas"), 
});

const mainfont = k.loadFont("VCR", "public/fonts/VCR_OSD_MONO_1.001.ttf")

k.scene("main", () => {

    k.setLayers(["bg", "obj", "ui"], "obj")
    k.setBackground(50, 200, 235)
        
    // config
    let vertical_speed = 0;
    let gravity = 0.1;
    let middleX = k.width() / 2;
    let middleY = k.height() / 2;
    let paused = false;
    let started = false;
    let restart = false;
    let score = 0;

    const pipeGap = 190;

    // player and pipes
    const bird = k.add([
        k.rect(64,64),
        k.pos(middleX, middleY),
        k.area(),
        k.color(255, 255, 0),
        k.layer("obj"),
        "player",
    ]);
         
    // jumping
    k.onKeyPress(["space", "z"], () => { 
        started = true;
        vertical_speed = -4;
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

    function gameOver(score){
        scoreCounter.opacity = 0;

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

        return;
    }


    // game logic
    k.onUpdate(() => {
        
        // "gravity"
        if (!paused && started){
        vertical_speed += gravity;
        bird.pos.y += vertical_speed;
        }
       
        // bound check
        if (bird.pos.y > k.height() - 64)
        {
            bird.pos.y = k.height() - 64; 
            vertical_speed = 0; 
            paused = true;
            gameOver(score);
        }
        if (bird.pos.y < 0){ bird.pos.y = 0; vertical_speed = 0; }

        // bird tilt
        // something about // if (vertical speed > tilt_threshold && bird.rotation < y) {bird.rotation += x;}

    })

    // pipe spawning
    k.loop(1.6, () => { // don't know if the original was like this, but this looks fine
        if (!paused && started) { spawnPipe(); }
    })
    
    // pipe movement
    k.onUpdate("pipe" , (pipe) => { // batch referencing all "pipe"s to move left
        if (!paused && started){  
            pipe.move(-220,0)
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