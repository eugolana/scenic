var canvas = document.getElementById("myCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var height = 640;
var width = 1525;
// PREPARE canvas



// cloud vars
var blocksize = 24;
var threshold = 0.55;
var cloudFrames = 1;
// perlin setup
var seed = Math.random();
var pn = new Perlin(seed);
var a = get_perlin(height, width ,blocksize, pn, 0);

// grass vars
var grass_number = 220;
var grass_min_height = 50
var grass_max_height = 250;
var grass_min_width = 3;
var grass_max_width = 11;
var grass_frame_chance = 1;
var grass_movement = 14;

// flower vars
flower_growth = 10;

var mousePoint = new Point(width/2, 0)
onMouseMove = function(event) {
  mousePoint = event.point
}

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

// Flower
var Flower = function(target, styleGenes ) {
  this.target = target;
  // 'styleGenes' is a serialisable object representation of the flower characteristics
  this.styleGenes = styleGenes;
  this.width = this.styleGenes.stalkWidth;
  this.base = new Point(this.target.x, height + 20);
  var second_point = new Point(this.target.x, height);
  this.growing = true;
  this.budding = false;
  this.flowering = false;
  this.flower = false;
  this.time = 0;
  this.rotation = 0;

  this.spine = new Path([this.base, second_point]);
  this.path = fatten_line(this.spine, this.width, 'point');
  this.moves = [];
  for (var i = 0; i < this.spine.length; i++) {
    this.moves.push( new Point(0,0));
  }
  this.path.fillColor = this.styleGenes.stalkColor;
  this.path.strokeColor = {
    hue: this.styleGenes.stalkColor.hue,
    saturation: 0.5,
    brightness: 0.4
  };
  this.path.strokeWidth = 1.5

}

Flower.prototype.run = function(target, amount) {
  if (this.growing) {
    this.grow(target, amount)
  }
  if (this.budding) {
    this.growBud(amount)
  }
  if (this.flowering) {
    this.growFlower(amount)
  }
  this.rotate();
}

Flower.prototype.grow = function(target, amount) {
  this.target = target;
  var toTarget = (target - this.spine.lastSegment.point);
  if (toTarget.length <= 30) {
    this.growing = false;
    this.budding = true;
  }
  var old_direction = (this.spine.lastSegment.point - this.spine.segments[this.spine.segments.length -2].point).normalize(amount * 0.75)
  var new_point = this.spine.lastSegment.point + toTarget.normalize(amount * 0.25) + old_direction;
  this.spine.add(new_point);
  this.moves.push(new Point(0,0));
  this.updatePath(1);
}

Flower.prototype.growBud = function(amount) {
  if (! this.flower) {
    this.createFlower()
    // this.flower.selected = true;
    // this.flower.rotate(Math.random() * 180, this.spine.lastSegment.point)
  }
  this.flower.scale(1.1, this.spine.lastSegment.point);
  if (this.flower.bounds.width >= this.styleGenes.innerSize) {
    this.budding = false;
    this.flowering = true;
  }
}

Flower.prototype.growFlower = function(amount) {
  v = this.budPetals(this.sepals, this.styleGenes.sepalSize, amount/4);
  if (v <= this.styleGenes.sepalSize * 0.75) {
    this.petals.moveAbove(this.sepals);
    this.flowerInner.moveAbove(this.sepals);
    if (this.budPetals(this.petals, this.styleGenes.flowerSize, amount/5) < this.styleGenes.flowerSize * 0.75) {
      this.flowerInner.moveAbove(this.petals)
    }
  }
}

Flower.prototype.budPetals = function(petals, size, amount) {
  template_circle = Path.Circle(this.spine.lastSegment.point, size);
  if (!template_circle.contains(petals.children[0].segments[0].point)) {
    return 0;
  }
  length = template_circle.length/ 2 / petals.children.length;
  for (var i = 0; i < petals.children.length; i++) {
    r_1 = 0.8 + Math.random() * 0.4;
    petal = petals.children[i];
    target = template_circle.getPointAt((length * (2 * i + 1 )))
    target.selected = true
    vector = target - petal.segments[0].point
    petal.segments[0].point += vector.normalize(amount * r_1)
  }
  return vector.length;
}

Flower.prototype.createFlower = function() {
  this.flower = new Group();
  circle_template = new Path.Circle(this.spine.lastSegment.point.clone(), 4);
  this.flowerInner = circle_template;
  circle_template.fillColor = this.styleGenes.innerColor;
  circle_template.strokeColor = {
    hue: this.styleGenes.innerColor.hue,
    saturation: 0.4,
    brightness: 0.4
  }
  circle_template.strokeWidth = 1.5;
  this.flower.addChild(circle_template)
  // draw petals
  petal_circle = new Path.Circle (this.spine.lastSegment.clone(), 3)
  petals = this.drawPetals(circle_template, this.styleGenes.petals, 'rounded',
        this.styleGenes.petalBaseWidth, this.styleGenes.petalTopWidth)
  this.petals = petals;
  // round petals
  for (var i = 0; i < petals.children.length; i++) {
    petals.children[i].fillColor = randomiseColor(this.styleGenes.petalColor, 15, 0.2, 0.2)
  }
  petals.strokeColor = {
    hue: this.styleGenes.petalColor,
    saturation: 0.4,
    brightness: 0.4
  }

  this.flower.addChild(petals);
  // Draw sepals
  sepals = this.drawPetals(circle_template, this.styleGenes.sepals, 'rounded', this.styleGenes.sepalBaseWidth, this.styleGenes.sepalTopWidth)
  this.sepals = sepals;
  for (var i = 0; i < sepals.children.length; i++) {
    sepals.children[i].fillColor = randomiseColor(this.styleGenes.sepalColor, 15, 0.2, 0.2)
  }
  sepals.strokeColor = {
    hue: this.styleGenes.sepalColor,
    saturation: 0.4,
    brightness: 0.4
  }
  this.flower.addChild(sepals);
  this.flower.strokeWidth = 1.5;

}


Flower.prototype.drawPetals = function(circ, number, type, baseWidth, topWidth) {
  length = circ.length/ (number * 2);
  circ_radius = circ.bounds.width;
  petals = new Group();
  if (baseWidth) {
    baseWidthOffset = (2 * length) - baseWidth
  } else {
    baseWidthOffset = 0
  }
  for (var i = 0; i < number; i++) {
    r_1 = 0.8 + Math.random() * 0.4
    r_2 = 0.8 + Math.random() * 0.4
    start = i * length * 2;
    // this is neessary for case where first petal starts at a negative position o the circle
    if (i == 0) {
      p1 = circ.getPointAt(circ.length - baseWidthOffset * r_1)
    } else {
        p1 = circ.getPointAt(start - baseWidthOffset * r_1) ;
    }
    p2 = circ.getPointAt(start + length);
    p3_temp = (start + (2 * length) + baseWidthOffset * r_1)
    p3 = circ.getPointAt(p3_temp % circ.length)
    arc = Path.Arc(p1, p2, p3);
    arc.insert(0, this.spine.lastSegment.point.clone());
    arc.closed = true;
    arc.smooth({type: 'catmull-rom'})
    if (type=='rounded') {
      vector = (p1 - p3) * topWidth
      arc.firstSegment.handleIn =   vector * -1 * r_2
      arc.firstSegment.handleOut =  vector * r_2
    }
    petals.addChild(arc);
  }
  return petals
  }

Flower.prototype.updatePath = function(number_of_additions) {
  var mid_seg = Math.floor(this.path.segments.length/2);
  var spine_segs = this.spine.segments;
  this.path.segments[mid_seg] = this.spine.lastSegment;
  var angle = (spine_segs[spine_segs.length - 1].point - spine_segs[spine_segs.length - 2].point).angle + 90;
  var w = this.width  *  (0.95 + Math.random() * 0.1);
  var vector = new Point({angle: angle, length: w});
  p1 = spine_segs[spine_segs.length - 2].point + vector;
  p2 = spine_segs[spine_segs.length - 2].point - vector;
  this.path.insert(mid_seg, p1);
  this.path.insert(mid_seg + 2, p2);
  if (this.path.segments.length > 7 && Math.random() > 0.6) {
    toRemove = this.spine.segments.length - 3
    this.path.removeSegment(toRemove);
    this.spine.removeSegment(toRemove)
    this.moves.splice(toRemove, 1);
    this.path.removeSegment(toRemove + 4)
    this.path.smooth({type:'continuous', from: 0, to: toRemove})
    this.path.smooth({type:'continuous', from: toRemove + 3, to: this.path.segments.length-1})

  }
  // this.path.simplify();
}

Flower.prototype.rotate = function() {
  if (this.spine.segments.length >= 6) {
    rotate = ( 0.15 - Math.random() * 0.3) + (this.rotation / 2);
    this.path.rotate(rotate, this.spine.firstSegment.point)
    if (this.flower) {
      this.flower.rotate(rotate, this.spine.firstSegment.point)
    }
  }
}



// Bugs

var Bug = function(pos, color) {
  this.pos = pos;
  this.color = color;
  this.bug = new Group();
  rect = new Rectangle(pos, new Size(10, 4));
  circle = new Path.Ellipse(rect)
  circle.fillColor = color;
  circle.strokeColor = '#222222'
  circle.strokeWidth = 1;
  stripes = new Group();
  stripes.addChild(new Path.Rectangle(new Rectangle(pos + new Point(2, 0), new Size(2, 4))))
  stripes.addChild(new Path.Rectangle(new Rectangle(pos + new Point(6, 0), new Size(2, 4))))
  stripes.fillColor = 'black'
  this.bug.addChild(circle)
  this.bug.addChild(stripes)
  this.movement = new Point(1,0)
}



Bug.prototype.move = function(target, amount) {
  target_traj = (target - this.pos).normalize(1);
  random_traj = new Point({length: 4, angle: Math.random() * 360})
  new_traj = (target_traj + random_traj + this.movement * 2).normalize(amount);
  this.bug.rotate(new_traj.angle - this.movement.angle)
  this.pos += new_traj
  this.bug.translate(new_traj)
  this.movement = new_traj
  if (this.pos.x < 0) {
    this.pos.x = width;
    this.bug.translate(new Point(width, 0))
  }
  if (this.pos.x > width) {
    this.pos.x = 0;
    this.bug.translate(new Point(-width, 0))
  }
  if (this.pos.y < 0) {
    this.pos.y = height;
    this.bug.translate(new Point(0, height))
  }
  if (this.pos.y > height) {
    this.pos.y = 0;
    this.bug.translate(new Point(0, - height))
  }

}

Bug.prototype.findFlowers = function(flowers, mouseFear, mouse) {
  forces = new Point(0,0);
  for (var i = 0; i < flowers.length; i++) {
    v = f[i].spine.lastSegment.point - this.pos;
    forces += new Point({angle: v.angle, length: 1 / (v.length * v.length)})
  }
  if (mouseFear) {
    v = this.pos - mouse;
    forces += new Point({angle: v.angle, length:  1/ (v.length * v.length)})
  }

  return forces.normalize(4);
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
  grasses.push(new Grass(p, g_height, g_width, g_color, 0.2));
}

// flowers


f = []
view.onClick = function(event) {
  size = 1 + Math.random()
  innerHue = Math.random() * 280;
  if (80 < innerHue  && innerHue < 160) {
    innerHue = innerHue + 80
  }
  styleGenes = {
    stalkColor: {hue: 80 + Math.random() * 20, saturation: 0.5, brightness: 0.6},
    stalkWidth: size * (1 + Math.random() * 3),
    flowerSize: 20 + Math.random() * 60 * size,
    sepalSize: 10 + Math.random() * 40 * size,
    innerSize:  20 + size *  20 * Math.random(),
    innerColor:  {hue: innerHue, saturation: 0.6, brightness: 0.7},
    sepals: Math.floor(4 + Math.random() * 3),
    sepalBaseWidth:  2 * Math.random(),
    sepalTopWidth:  2 * Math.random(),
    petals: Math.floor(5 + Math.random() * 12),
    sepalColor: {hue: 80 + Math.random() * 20, saturation: 0.5, brightness: 0.6},
    petals: Math.floor(6 + Math.random() * 6),
    petalColor:{hue: Math.random() * 360, saturation: 0.6, brightness: 0.7},
    petalBaseWidth:  2 * Math.random(),
    petalTopWidth:  2 * Math.random(),
  }
  f.push(new Flower( mousePoint, styleGenes))
}


b = []
for (var i = 0; i < 24; i++) {
  b.push(new Bug(new Point(width/2, height/2), {hue: 60, saturation: 1, brightness: 0.7}))

}


// run loop
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
  for (var i = 0; i < f.length; i++) {
    f[i].run(mousePoint, flower_growth)
  }
  for (var i = 0; i < b.length; i++) {
    bug = b[i]
    // should eit to prevent it following not-yet born flowers
    attraction = bug.findFlowers(f, mouseFear = true, mouse= mousePoint);
    bug.move(bug.pos + attraction  , 4)
    bug.bug.bringToFront();

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


function randomiseColor(color, r_h, r_s, r_b){
  c =  {
    hue: Math.max(Math.min(color.hue + (r_h * (Math.random() - 0.5)), 360), 0),
    saturation: Math.max(Math.min(color.saturation + (r_s * (Math.random() - 0.5)), 1), 0),
    brightness: Math.max(Math.min(color.brightness + (r_b * (Math.random() - 0.5)), 1), 0),
  }
  return c
}
