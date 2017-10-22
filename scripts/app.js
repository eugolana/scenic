var canvas = document.getElementById("myCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var height = 740;
var width = 1525;

var blocksize = 32;
var threshold = 0.6;
var cloudFrames = 1;

var grass_number = 600;
var grass_min_height = 100
var grass_max_height = 350;
var grass_min_width = 3;
var grass_max_width = 11;
var grass_frame_chance = 1;
var grass_movement = 34;

var seed = Math.random();
var pn = new Perlin(seed);
var a = get_perlin(height, width ,blocksize, pn, 0);


// Define elements

// clouds
var Clouds = function( width, height, blocksize, threshold) {
  this.width = width;
  this.height = height;
  this.blocksize = blocksize;
  this.threshold = threshold;
  this.clouds = [];
}

Clouds.prototype.initialize = function(){
  var shapes = [];
  for (var i = -1; i < this.width/this.blocksize ; i++) {
    var row = [];
    for (var ii = -1; ii < this.height/this.blocksize ; ii++) {
      var rect = new Rectangle( [i * this.blocksize, ii * this.blocksize], [this.blocksize * 2, this.blocksize * 2]);
      var path = new Path.Rectangle(rect, this.blocksize/4);
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
        this.clouds[i][ii].opacity =  (a[i][ii] /3 );
        this.clouds[i][ii].fillColor = new Color(255,255,255)
      } else {
        this.clouds[i][ii].opacity = 0;
      }
    }
  }
}

// grass
var Grass = function(base, height, width, color, displacement) {
  this.base = base;
  this.bladeheight = height;
  this.bladewidth = width;
  this.bladecolor = color;
  this.displacement = displacement;
  this.tip = new Point(base.x + ((Math.random() - 0.5) * 120), base.y - this.bladeheight);
  spine = new Path.Line(this.base, this.tip);
  this.spine = midline_displacement(spine, 1, this.displacement);
  this.path = fatten_line(this.spine,  this.bladewidth , 'point');
  this.spine.smooth({ type: 'continuous'});
  this.moves = [];
  for (var i = 0; i < this.spine.segments.length; i++) {
    this.moves.push( new Point(0,0) );
  }
  this.styling_init();
}

Grass.prototype.styling_init = function(){
  // draw stuff
  this.spine.strokeWidth = 12;
  this.path.fillColor = this.bladecolor;
  this.path.strokeColor = {
    hue: this.bladecolor.hue,
    saturation: 0.5,
    brightness: 0.4
  };
  this.path.strokeWidth = 1.5;

}

Grass.prototype.sway = function(amount) {
  for (var i = 1; i < this.moves.length; i++) {
    // 'collect' sway moving from bottom to top
    var direction = (this.spine.segments[i-1].point - this.spine.segments[i].point).angle + 90;
    var sway = (0.5 - Math.random()) * amount;
    var vector = new Point({length: sway, angle: direction});
    if (Math.random() > 0.5) {
      vector *= -1;
    }
    for (var ii = i; ii < this.spine.segments.length; ii++) {
      this.moves[ii] += vector/4;
      this.moves[ii] *= 4/5;
    }
  }
  for (var i = 0; i < this.moves.length; i++ ) {
    this.spine.segments[i].point += this.moves[i];
    this.path.segments[i].point += this.moves[i];
    if (i != this.moves.length - 1) {
      this.path.segments[ (this.moves.length * 2) - i - 2].point += this.moves[i];
    }
  }
}

var Stalk = function() {

}

// INITIALISING STUFF

var clouds = new Clouds(width, height, blocksize, threshold);
clouds.initialize();

grasses = [];

for (var i = 0; i < grass_number; i++) {
  p = new Point( Math.random() * width ,height + 20);
  g_height = grass_min_height + ( Math.random() * (grass_max_height - grass_min_height));
  g_width = grass_min_width + (Math.random() * (grass_max_width - grass_min_width));
  g_color = {hue: 60 + Math.random() * 20, saturation: 0.6, brightness: 0.8};
  // console.log("made it this fars");
  grasses.push(new Grass(p, g_height, g_width, g_color, 0.2));
}

n = 0;
function onFrame(event) {
  // draw clouds eery <cloudFrames> frames
  if (n% cloudFrames == 0){
    a = get_perlin(width, height, blocksize, pn, n/1.7);
    clouds.run(a);
  }
  for ( var i = 0; i < grasses.length; i++) {
    if (Math.random() < grass_frame_chance) {
      sway_amount = (Math.random() - 0.5)  * grass_movement;
      grasses[i].sway(sway_amount);
    }
  }
  n += 1;
}


// HELPERS

// Cloud helpers
function get_perlin(width, height, blocksize, pn, offset) {
  // This function needs to be generalised
  // produces pseudo-harmonic perlin noise
  a = [];
  for (var i = 0; i <= width / blocksize; i ++) {
    a[i] = [];
    for (var ii = 0; ii <= height / blocksize; ii ++) {
      nn = pn.noise((i + offset/5)/20, (ii + offset/35)/20, offset/100) * 0.5;
      nn += pn.noise((i + offset/10)/20, (ii + offset/70)/20, offset/200) * 0.25;
      nn += pn.noise((i + offset/20)/20, (ii + offset/140)/20, offset/400) * 0.25;
      a[i][ii] = nn;
    }
  }
  return a;
}

// path/grass helpers
function midline_displacement(path, repeat, displacement){
  new_path = path.clone();
  for (var i = 0; i < path.segments.length - 1; i++) {
    midpoint = new Point((path.segments[i].point + path.segments[i + 1].point)  / 2);
    if (displacement > 0) {
        distance = (path.segments[i].point - path.segments[i + 1].point).length;
        angle = (midpoint - path.segments[i]).angle + 90;
        offset = new Point({length: (Math.random() - 0.5) * displacement * distance, angle: angle});
        midpoint += offset;
    }
    // insert midpoint at *iii +1 to offset already isnerted segments
    new_path.insert((2 * i) + 1, midpoint );
  }
  if (repeat > 1) {
    repeat -= 1;
    return midline_displacement(new_path, repeat , displacement);
  }
  return new_path;
}

function fatten_line(path, width, type){
  up = [];
  down = [];
  for (var i = 0; i < path.segments.length - 1; i++) {
    var angle = (path.segments[i].point - path.segments[i + 1].point ).angle + 90;
    var vector = new Point({length: width/2, angle: angle});
    up.push(new Point(path.segments[i].point + vector));
    down.push(new Point(path.segments[i].point - vector));
  }
  if (type == 'point') {
    up.push(path.lastSegment.point);
  } else {
    up.push(new Point(path.segments[i].point + vector));
    down.push(new Point(path.segments[i].point - vector));
  }
  down.reverse()
  path = new Path(up);
  path.smooth({type: 'continuous'});
  down_path = new Path(down);
  down_path.smooth({type: 'continuous'});
  path.addSegments(down_path.segments);
  path.closed = true;
  return path;
}
