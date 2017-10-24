var canvas = document.getElementById("myCanvas");
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;

var height = 640;
var width = 1525;
// PREPARE canvas

backrect = new Rectangle(new Point(0,0), new Size(width, height));
background = new Path.Rectangle(backrect)
background.fillColor = "#CCCCEE";
// Path for Logo
var eugolanaPath = "M 1,7 C 5.2806765,7.0122727 6.8025318,-2.3301493 1.536363,0.72985777 -2.0304234,3.3748364 0.55402749,10.681482 5.3690855,8.8214518 8.8842563,7.8359366 10.872503,1.5703671 11.861503,0.49780978 11.295182,3.0930052 7.7695093,8.3598033 12.104833,9.0553404 15.70888,9.4803359 19.14601,2.3619932 19.168724,2.5731522 16.720892,5.4726273 18.375392,11.599074 22.333716,7.6662838 23.580656,3.2480975 28.026009,-2.7722869 33.030097,0.87800975 35.262825,4.8995936 31.705276,-1.6900215 29.112216,0 c -5.525077,0.67265388 -5.35376,10.203987 0.707769,8.9566551 2.903678,-0.3310676 3.653457,-3.1308545 4.188844,-5.4875562 0.540925,-1.913846 1.473594,-5.1537079 0.354913,-1.1209745 -1.678664,5.7804194 -3.715495,11.4718136 -6.001337,17.0302006 -4.168049,4.39606 -4.159417,-4.322407 -0.929208,-5.869694 4.004444,-4.196505 10.704111,-5.4286502 13.319115,-10.9927401 1.18397,-2.04112404 6.231694,-3.5192812 1.749011,-1.3644477 -4.808528,1.6955987 -2.034672,9.6900038 2.867761,7.6700086 4.645473,-0.3355101 4.816126,-10.0656553 -0.02476,-8.01865682 -2.201689,4.74078812 5.438346,7.11221772 8.156253,3.69663062 3.0266,-4.21949637 6.210625,-8.6259493 7.483288,-13.7297998 0.165455,-5.5439958 -5.294584,-0.1971572 -4.662472,2.8234935 -0.914364,4.7874757 -1.740701,9.7003662 -1.154532,14.5737388 3.290287,2.5368939 5.933852,-2.8365463 7.492722,-5.199232 1.041962,-4.2106719 7.88617,-3.09885731 7.939254,-0.7053659 -2.10013,-4.9914903 -10.134398,-0.860649 -8.479534,3.8994193 0.815749,3.9483245 7.250917,3.6982542 7.874309,-0.2518528 0.782781,-1.8715848 2.675752,-8.6176707 1.4871,-3.3617068 -1.521013,3.0480171 -0.126096,9.0212381 3.853007,5.1181639 2.454858,-2.1621943 3.125398,-6.3194451 6.344379,-7.45361388 3.439089,0.97343598 -1.055089,8.01053778 -0.51883,8.23454658 1.21133,-3.1258694 2.408158,-7.3514376 5.984755,-8.39483437 5.929796,-0.56489833 0.02788,6.29776537 2.597698,8.73001907 5.841201,0.8550775 5.466809,-8.21587694 10.762539,-8.80973388 2.12476,-0.17063805 5.35176,2.08407048 1.49117,0.12535853 -4.6144,-1.38104665 -8.479735,5.91570565 -4.057726,8.44514585 4.676736,2.3382713 6.854176,-3.3187161 7.508276,-6.9078479 1.2804,-3.5941723 -1.74987,5.102303 -1.39635,6.6963847 0.61502,2.0540015 4.42987,-1.4332 4.45485,-0.4615053 0.12626,4.9120298 -9.594585,9.5339418 -16.504764,6.0046388 C 87.974566,11.533928 79.85377,18.661013 60.673374,13.728273 51.274823,11.76225 48.498029,13.903863 28.692932,13.432135 21.913116,13.897957 15.620875,17.444503 8.7094088,16.603563 4.8028107,16.193407 -0.63380641,12.180539 -1.1197694,9.2062798 -1.4538499,7.7497875 -0.66586971,7.6740853 1,7 Z"



// cloud vars
var blocksize = 32;
var threshold = 0.57;
var cloudFrames = 2;
// perlin setup
var seed = Math.random();
var pn = new Perlin(seed);
var a = get_perlin(height, width ,blocksize, pn, 0);

// grass vars
var grass_number = 160;
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

AnimatedPath = function( datastring, offset, scale, color, textWidth, maxLength, lightWidth ){
  this.datastring = datastring
  this.offset = offset;
  this.scale = scale;
  this.maxLength = maxLength
  this.lightNumber = 12
  this.logoPath = new Path(this.datastring);
  this.logoPath.strokeColor = color;
  this.logoPath.opacity = 0.01;
  this.logoPath.strokeWidth = textWidth;
  this.logoPath.translate(offset)
  this.logoPath.scale(scale)
  // this.logoPath.sendToBack()
  // p.selected = true

  this.lightHeadPos = this.logoPath.segments[0].point.clone();
  this.lights = new Group()
  for (var i = 0; i < this.lightNumber; i++) {
    c = new Path([this.lightHeadPos])
    c.strokeColor = color
    c.opacity = (i+1) * 0.1
    c.strokeWidth = lightWidth - (i * 0.3)
    console.log(c.strokeWidth)
    this.lights.addChild(c)
  }
  console.log(this.lights);
  // this.lights.strokeWidth = lightWidth
  this.lights.strokeJoin = 'round'
  // this.light.sendToBack();
}


AnimatedPath.prototype.tracePath = function(n, amount) {
  moveTo = this.logoPath.getPointAt((n * amount) % this.logoPath.length);
   this.lightHeadPos = moveTo
   for (var i = 0; i < this.lightNumber; i++) {
     light = this.lights.children[i]
     light.add(moveTo)
     light.smooth({type: 'continuous'})
     divider = (i+1) * (i+1);
     while (light.length > this.maxLength/ divider ) {
       light.removeSegment(0)
     }
   }
  }


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
    r_x = 0.95 + Math.random() * 0.1
    r_y = 0.95 + Math.random() * 0.1
    r_1 = 0.8 + Math.random() * 0.4;
    petal = petals.children[i];
    target = template_circle.getPointAt((length * (2 * i + 1 )))
    target.selected = true
    vector = target - petal.segments[0].point + new Point(r_x, r_y)
    petal.segments[0].point += vector.normalize(amount * r_1)
    if (petal.segments[0].handleOut.length < petals.topWidth) {
      petal.segments[0].handleIn *= 1.1;
      petal.segments[0].handleOut *= 1.1;
    }
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
  petals.opacity = 0.95;

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
  petals.baseWidth = baseWidth;
  petals.topWidth = topWidth;
  if (baseWidth) {
    baseWidthOffset = (2 * length) - baseWidth
  } else {
    baseWidthOffset = 0
  }
  for (var i = 0; i < number; i++) {
    r_1 = 0.7 + Math.random() * 0.6
    r_2 = 0.6 + Math.random() * 0.8
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
      vector = (p1 - p3) * topWidth / 10
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
    rotate = ( 0.15 - Math.random() * 0.3) + (this.rotation * 0.7);
    this.path.rotate(rotate, this.spine.firstSegment.point)
    if (this.flower) {
      this.flower.rotate(rotate, this.spine.firstSegment.point)
    }
    this.rotation = rotate;
  }
}



// Bugs

var Bug = function(pos, color) {
  this.pos = pos;
  this.color = color;
  this.bug = new Group();
  rect = new Rectangle(pos, new Size(20, 8));
  circle = new Path.Ellipse(rect)
  circle.fillColor = color;
  circle.strokeColor = '#222222'
  circle.strokeWidth = 1;
  stripes = new Group();
  stripes.addChild(new Path.Rectangle(new Rectangle(pos + new Point(4, 0), new Size(4, 8))))
  stripes.addChild(new Path.Rectangle(new Rectangle(pos + new Point(12, 0), new Size(4, 8))))
  wings = new Group();
  wings.addChild(new Path.Circle(pos + new Point(10,-3), 4));
  wings.addChild(new Path.Circle(pos + new Point(10,11), 4));
  wings.fillColor = 'white'
  wings.strokeColor = '#222222'
  wings.opacity = 0.3;
  stripes.fillColor = 'black'
  this.bug.addChild(circle)
  this.bug.addChild(stripes)
  this.bug.addChild(wings)
  this.wings = wings
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
  // flicker wings
  if (this.wings.visible && Math.random() > 0.05) {
    this.wings.visible = false;
  } else {
    if (!this.wings.visible&& Math.random() > 0.1) {
      this.wings.visible = true;
    }
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
  innerHue = Math.random() * 230;
  if (50 < innerHue  && innerHue < 180) {
    innerHue = innerHue + 130
  } else {
  }

  styleGenes = {
    stalkColor: {hue: 80 + Math.random() * 20, saturation: 0.5, brightness: 0.6},
    stalkWidth: size * (1 + Math.random() * 2.3),
    flowerSize: 30 + Math.random() * 40 * size,
    sepalSize: 10 + Math.random() * 30 * size,
    innerSize:  20 + size *  20 * Math.random(),
    innerColor:  {hue: innerHue, saturation: 0.6, brightness: 0.7},
    sepals: Math.floor(4 + Math.random() * 3),
    sepalBaseWidth:  2 * Math.random(),
    sepalTopWidth:  5 * Math.random(),
    petals: Math.floor(5 + Math.random() * 12),
    sepalColor: {hue: 80 + Math.random() * 20, saturation: 0.5, brightness: 0.6},
    petals: Math.floor(6 + Math.random() * 6),
    petalColor:{hue: Math.random() * 360, saturation: 0.6, brightness: 0.7},
    petalBaseWidth:  2 * Math.random(),
    petalTopWidth:  5 * Math.random(),
  }
  f.push(new Flower( mousePoint, styleGenes))
}


b = []
for (var i = 0; i < 12; i++) {
  b.push(new Bug(new Point(Math.random() * width, height/2 + Math.random() * height * 0.5), {hue: 60, saturation: 1, brightness: 0.7}))

}

// LOGO path

logo = new AnimatedPath(eugolanaPath, offset = new Point(300,100), scale=5,
  color = '#222222', textWidth = 3, maxLength = 1400, lightWidth=3)


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
    bug.move(bug.pos + attraction  , 5)
    bug.bug.bringToFront();

  }
  logo.tracePath( n, 12)
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
