import kaplay from "kaplay";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

const k = kaplay({
    width: window.screen.width * 0.75,
    height: window.screen.height * 0.75,
    canvas: document.getElementById("canvas"),
});

k.scene("main", () => {
    
    // config
    let vertical_speed = 0;
    let gravity = 0.1;
    let middleX = k.width() / 2;
    let middleY = k.height() / 2;

    let paused = false;

    // player
    const bird = k.add([
        k.rect(64,64),
        k.pos(middleX, middleY),
        k.area(),
        // k.body(), // for gravity 
        k.color(255,0,0),
        "player",
    ]);

     // jump logic
    k.onKeyPress(["space", "z"], () => {
        vertical_speed = 0
        vertical_speed = -5;
    })

    // logic
    k.onUpdate(() => {
        
        
        // gravity?
        if (!paused){
        vertical_speed += gravity;
        bird.pos.y += vertical_speed;
        }
       


        // bound check
        if (bird.pos.y > k.height() - 64){bird.pos.y = k.height() - 64; vertical_speed = 0;}
        if (bird.pos.y < 0){ bird.pos.y = 0; vertical_speed = 0; }
    
        
    })
    
});
k.go("main");