const scale = 150;

const camDistance = .5;
const wDistance = 5;
let angleX = 0;
let angleY = 0;
let angleXW = 0;
let angleYW = 0;
let angleZW = 0;

const vertices = [
  [-1, -1, -1, -1],
  [-1, -1, -1,  1],
  [-1, -1,  1, -1],
  [-1, -1,  1,  1],
  [-1,  1, -1, -1],
  [-1,  1, -1,  1],
  [-1,  1,  1, -1],
  [-1,  1,  1,  1],
  [ 1, -1, -1, -1],
  [ 1, -1, -1,  1],
  [ 1, -1,  1, -1],
  [ 1, -1,  1,  1],
  [ 1,  1, -1, -1],
  [ 1,  1, -1,  1],
  [ 1,  1,  1, -1],
  [ 1,  1,  1,  1]
];

const edges = [
  // Inner cube (w = -1)
  [0, 1], [0, 2], [0, 4], [1, 3], 
  [1, 5], [2, 3], [2, 6], [3, 7], 
  [4, 5], [4, 6], [5, 7], [6, 7],
  
  // Outer cube (w = 1)
  [8, 9], [8, 10], [8, 12], [9, 11], 
  [9, 13], [10, 11], [10, 14], [11, 15], 
  [12, 13], [12, 14], [13, 15], [14, 15],
  
  // Connecting edges between w = -1 and w = 1
  [0, 8], [1, 9], [2, 10], [3, 11], 
  [4, 12], [5, 13], [6, 14], [7, 15]
];


setTimer(draw, 10);

function draw() {
    wipe(); 
    
    const projectedVertices = vertices.map(v => toPoint(v));
    edges.map((edge) => {
        let x1, x2, y1, y2;
        
        x1 = projectedVertices[edge[0]][0];
        y1 = projectedVertices[edge[0]][1];
        
        x2 = projectedVertices[edge[1]][0];
        y2 = projectedVertices[edge[1]][1];
        
        let line = new Line(x1, y1, x2, y2);
        line.setColor("white");
        
        add(line);
    })
    
    angleX -= .01;
    angleY += .02;
    angleYW += .013;
}

function wipe() {
    removeAll();
    let bg = new Rectangle(getWidth(), getHeight());
    add(bg);
}

// rotate a 4D point p in the plane of coordinates i and j
function rotate(p, i, j, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  const a = p[i], b = p[j];
  const out = [...p];
  out[i] = a * c - b * s;
  out[j] = a * s + b * c;
  return out;
}

// e.g. XW plane: rotate(p, 0, 3, angle)
function toPoint(point) {
    let rotatedY = rotate(point, 0, 2, angleY);
    let rotatedX = rotate(rotatedY, 1, 2, angleX);
    let final = rotate(rotatedX, 1, 3, angleYW);
    
    let [x, y, z, w] = final;
    let W = w + wDistance;
    
    x /= W;
    y /= W;
    z /= W;
    
    let Z = z + camDistance;
    
    let X = (x/Z) * scale + getWidth()/2;
    let Y = (y/Z) * scale + getHeight()/2;
    
    
    return [X, Y];
}