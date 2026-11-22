const radius = 10;
const dt = .2
const gravity = 9.81;

let degrees;
let speed;
let rad;

let ball = new Circle(radius);
let hoop;
let floor;


const startX = radius;
const startY = getHeight() - (radius + 20);
let x;
let y;
let velX;
let velY;
let line;

let pressing = false;

let isPressingW = false;
let isPressingS = false;
let isPressingA = false;
let isPressingD = false;

let playing = false;

let osc = 0;

function checkControls() {
    if (isPressingA) {
        rement(degrees, 2);
    }
    if (isPressingD) {
        rement(degrees, -2);
    }
    if (isPressingS) {
        rement(speed, -2);
    }
    if (isPressingW) {
        rement(speed, 2);
    }
    
    
}

function keyDown(e) {
    if (e.key == "w") {
        isPressingW = true;
    }
    if (e.key == "s") {
        isPressingS = true;
    }
    if (e.key == "a") {
        isPressingA = true;
    }
    if (e.key == "d") {
        isPressingD = true;
    }
    if (e.key == " ") {
        if (playing) return;
        playing == true;
        stopTimer(checkControls);
        remove(line);
        setTimer(update, 10);
        setTimer(lose, 10000);
    }
}
function keyUp(e) {
    if (e.key == "w") {
        isPressingW = false;
    }
    if (e.key == "s") {
        isPressingS = false;
    }
    if (e.key == "a") {
        isPressingA = false;
    }
    if (e.key == "d") {
        isPressingD = false;
    }
}


function rement(value, add) {
    if (value == degrees)
        degrees =  (value + add) % 360;
    else
        speed = Math.max(20, Math.min(100, value + add))
    
    rad = (degrees * Math.PI / 180);
   
    velX = speed * Math.cos(rad);
    velY = -speed * Math.sin(rad);
    
    line.setEndpoint(x + velX, y + velY)   
}

ball.setPosition(startX, startY);

function setup() {
    // startGame();
    
    drawMenu();
}
function update() {

    projectilePhysics();
    
    remove(ball);
    collide();
    add(ball);
    
    drawTrail();
    
    
    
}


function center(txt, y) {
    txt.setPosition( (getWidth() - txt.getWidth()) / 2, y);
}
function drawMenu() {
    let header = new Text("Crappy Basketball", "18pt Comic Sans MS");
    
    center(header, 50);
    add(header)
    
    let btn = new Rectangle(150, 50);
    let btnLbl = new Text("Play", "15pt Comic Sans MS");
    
    center(btn, 200);
    center(btnLbl, 230)
    
    btn.setColor("#dd3333");
    add(btn)
    add(btnLbl)
    
    function handleBtnClick(e) {
        let clicked = getElementAt(e.getX(), e.getY())
        
        if (clicked == btn || clicked == btnLbl) {
            startGame();
        }
    }
    mouseClickMethod(handleBtnClick);
}

function startGame() {
    removeAll();
    drawFloor();
    drawHoop();
    
    
        let txt = new Text(`
       
        Use A and D arrows to change angle
        
        `, "12pt Comic Sans MS");
        center(txt, 50)
        add(txt)
        let txt2 = new Text(`
       
        Use W and S to change speed, space to shoot
        
        `, "12pt Comic Sans MS");
        center(txt2, 74)
        add(txt2)
    
    
    degrees = 45;
    speed = 20;
    
    keyDownMethod(keyDown)
    keyUpMethod(keyUp)
    
    rad = (degrees * Math.PI / 180);
   
    velX = speed * Math.cos(rad);
    velY = -speed * Math.sin(rad);
    x = startX;
    y = startY;
    
    
    line= new Line(x, y, x + velX, y + velY);
    add(ball)
    add(line)
    ball.setPosition(x, y);
    setTimer(checkControls, 20);
    setTimer(moveHoop, 60);
}
function drawFloor() {
    floor = new Rectangle(getWidth(), 20);
    floor.setPosition(0, getHeight() - 20);
    add(floor);
}
function drawHoop() {
    hoop = new Rectangle(50, 10);
    hoop.setPosition(getWidth() - 50, Randomizer.nextInt(-2,2) * 50 + getHeight()/2);
    
    hoop.setColor("red");
    add(hoop);
}


function projectilePhysics() {
    x += velX * dt;
    y += velY * dt;
    
    velY += gravity * dt;
    
    ball.setPosition(x, y);
}
function collide() {
    let surface = getElementAt(x, y + radius + 1);

    if (surface == floor) {
        y = surface.getY() - radius;
        velY = -velY * .75;
    } 
    if (y <= 0) {
        y = 0;
        velY = -velY * .75;
    }
    if (x <= 0) {
        x = 0;
        velX = -velX * .75;
    }
    if (x >= getWidth()) {
        x = getWidth();
        velX = -velX * .75;
    }
    if (getElementAt(x, y) == hoop) {
        win();
        return;    
        
    }
    
}
function moveHoop() {
    hoop.setPosition(hoop.getX(), hoop.getY() + Math.cos(osc) * 4);
    osc+= .05;
}

function drawTrail () {
    let trail = new Circle(1)
    trail.setPosition(x,y);
    
    add(trail);
}


function endGame() {
    playing = false;
    x = 99999;
    update();
    
    stopTimer(update);
    stopTimer(lose);
    
    removeAll();
    
    
    let btn = new Rectangle(150, 50);
    let btnLbl = new Text("Play", "15pt Comic Sans MS");
    
    center(btn, 200);
    center(btnLbl, 230)
    
    btn.setColor("#dd3333");
    add(btn)
    add(btnLbl)
    
    function handleBtnClick(e) {
        let clicked = getElementAt(e.getX(), e.getY())
        
        if (clicked == btn || clicked == btnLbl) {
            startGame();
        }
    }
    mouseClickMethod(handleBtnClick);
}
function win() {
    endGame();
    
    let txt = new Text("You is the have win!", "30pt Arial");
    txt.setColor("yellow");
    center(txt, 100);
    
    add(txt);
    
}
function lose() {
    endGame();
        
    let txt = new Text("LMAOOOO NOOB", "30pt Comic Sans MS");
    txt.setColor("red");
    center(txt, 150);

    
    add(txt);
}



setup();