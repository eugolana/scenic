var canvas = document.getElementById("myCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var height = canvas.height;
var width = canvas.width;

var blocksize = 32;
var threshold = 0.45;
var cloudFrames = 1;

var grass_number = 500;
var grass_min_height = 100
var grass_max_height = 350;
var grass_min_width = 4;
var grass_max_width = 14;
var grass_frame_chance = 1;
var grass_movement = 24;

var seed = Math.random();
var pn = new Perlin(seed);
var a = get_perlin(height, width ,blocksize, pn, 0)



var Clouds = function( width, height, blocksize, threshold) {
  this.width = width;
  this.height = height;
  this.blocksize = blocksize;
  this.threshold = threshold;
  this.clouds = []
}

Clouds.prototype.initialize = function(){
  var shapes = []
  for (var i=0; i < this.width/this.blocksize ; i++) {
    var row = [];
    for (var ii=0; ii < this.height/this.blocksize ; ii++) {
      var rect = new Rectangle( [i * this.blocksize, ii * this.blocksize], [this.blocksize * 3,this.blocksize * 3]);
      var path = new Path.Rectangle(rect, 0);
      row.push(path);
    }
    shapes.push(row);
  }
  this.clouds =  shapes;
}

Clouds.prototype.run = function(a){
  for (var i = 0; i < a.length; i++) {
    for (var ii = 0; ii < a[0].length; ii++) {
      if (a[i][ii] >= this.threshold) {
        this.clouds[i][ii].opacity =  (a[i][ii] /4 );
        this.clouds[i][ii].fillColor = new Color(255,255,255)
      } else {
        this.clouds[i][ii].opacity = 0;
      }
    }
  }
}

var clouds = new Clouds(width, height, blocksize, threshold);
clouds.initialize()

var Grass = function(base, height, width, color, displacement) {
  this.base = base;
  this.bladeheight = height;
  this.bladewidth = width;
  this.bladecolor = color;
  this.displacement = displacement;
  this.tip = new Point(base.x + ((Math.random() - 0.5) * 120), base.y - this.bladeheight);

  spine = new Path.Line(this.base, this.tip);
  this.spine = midline_displacement(spine, 2, this.displacement);
  this.path = fatten_line(this.spine,  this.bladewidth );
  this.spine.smooth({ type: 'continuous'})
  this.moves = []
  for (var i = 0; i < this.spine.segments.length; i++) {
    this.moves.push( new Point(0,0) )
  }

  // draw stuff
  this.spine.strokeWidth = 12;
  this.path.fillColor = this.bladecolor;
  this.path.strokeColor = '#226622';
  this.path.strokeWidth = 1.5

}

Grass.prototype.sway = function(amount) {
  for (var i = 1; i < this.moves.length; i++) {
    // 'collect' sway moving from bottom to top
    direction = (this.spine.segments[i-1].point - this.spine.segments[i].point).angle + 90;
    sway = (0.5 - Math.random()) * amount;
    vector = new Point({length: sway, angle: direction})
    if (Math.random() > 0.5) {
      vector *= -1;
    }
    for (var ii = i; ii < this.spine.segments.length; ii++) {
      this.moves[ii] += vector/4
      this.moves[ii] *= 4/5;
    }
  }
  for (var i = 0; i < this.moves.length; i++ ) {
    this.spine.segments[i].point += this.moves[i];
    this.path.segments[i].point += this.moves[i];
    if (i != this.moves.length - 1) {
      this.path.segments[ (this.moves.length * 2) - i - 2].point += this.moves[i]
    }
  }
}
grasses = [];

for (var i = 0; i < grass_number; i++) {
  p = new Point( Math.random() * width ,height + 20);
  g_height = grass_min_height + ( Math.random() * (grass_max_height - grass_min_height));
  g_width = grass_min_width + (Math.random() * (grass_max_width - grass_min_width));
  g_color = {hue: 60 + Math.random() * 20, saturation: 0.7, brightness: 0.7};
  // console.log("made it this fars");
  grasses.push(new Grass(p, g_height, g_width, g_color, 0.2));
}
// console.log(grasses)

n = 0;
function onFrame(event) {
  // draw clouds eery <cloudFrames> frames
  if (n% cloudFrames == 0){
    a = get_perlin(width, height, blocksize, pn, n/1.7);
    clouds.run(a);
    // console.log("run clouds")
  }
  // canvas.style.webkitFilter = "blur(1px)";
  for (var g = 0; g < grasses.length; g++) {
    if (Math.random() < grass_frame_chance) {
      sway_amount = (Math.random() - 0.5)  * grass_movement
      grasses[g].sway(sway_amount)
    }
  }

  n += 1;
}


// HELPERS

// Cloud helpers
function get_perlin(width, height, blocksize, pn, offset) {
  // This function needs to be generalised
  // produces pseudo-harmonic perlin noise
  a = []
  for (var i = 0; i <= width / blocksize; i ++) {
    a[i] = [];
    for (var ii = 0; ii <= height / blocksize; ii ++) {
      nn = pn.noise((i + offset/5)/20, (ii + offset/35)/20, offset/100) * 0.5
      nn += pn.noise((i + offset/10)/20, (ii + offset/70)/20, offset/200) * 0.25
      nn += pn.noise((i + offset/20)/20, (ii + offset/140)/20, offset/400) * 0.25
      a[i][ii] = nn;
    }
  }
  return a;
}


// path/grass helpers
function midline_displacement(path, repeat, displacement){
  new_path = path.clone();
  for (var iii = 0; iii < path.segments.length - 1; iii++) {
    midpoint = new Point((path.segments[iii].point + path.segments[iii+1].point)  / 2);
    if (displacement > 0) {
        distance = (path.segments[iii].point - path.segments[iii + 1].point).length
        angle = (midpoint - path.segments[iii]).angle + 90;
        offset = new Point({length: (Math.random() - 0.5) * displacement * distance, angle: angle})
        midpoint += offset
    }
    new_path.insert((2 *iii)+1,midpoint)
  }
  if (repeat > 1) {
    repeat -= 1
    return midline_displacement(new_path, repeat , displacement)
  }
  return new_path
}

function fatten_line(path, width){
  up = [];
  down = [];
  for (var i = 0; i < path.segments.length - 1; i++) {
    var angle = (path.segments[i].point - path.segments[i + 1].point ).angle + 90;
    vector = new Point({length: width/2, angle: angle})
    up.push(new Point(path.segments[i].point + vector));
    down.push(new Point(path.segments[i].point - vector));
  }
  down.reverse()
  up.push(path.lastSegment.point);
  path = new Path(up);
  path.smooth({type: 'continuous'})
  down_path = new Path(down);
  down_path.smooth({type: 'continuous'})
  path.addSegments(down_path.segments)
  path.closed = true
  // console.log("LENGTH: " + path.segments.length)
  return path
}
