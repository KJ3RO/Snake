import kaboom, { GameObj } from "kaboom";

const STAGE_WIDTH = 17 * 30;
const STAGE_HEIGHT = 15 * 30;
const STAGE_SCALE = 1.5;

const k = kaboom({
  width: STAGE_WIDTH * STAGE_SCALE,
  height: STAGE_HEIGHT * STAGE_SCALE,
  background: [0, 0, 0],
  canvas: document.querySelector(".myCanvas") as HTMLCanvasElement,
});

const { 
  vec2, 
  rect, 
  area, 
  color, 
  loadSprite, 
  add, 
  sprite, 
  scene, 
  go, 
  addLevel,
  pos,
  wait,
  onKeyPress,
  onUpdate,
  dt,
  destroy,
  rand,
  onCollide,
  anchor,
  camPos,
  camScale,
} = k;

const block: number = 30;

const MAP = [
  "=================",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=               =",
  "=================",
];

const mapConfig = {
  tileWidth: block,
  tileHeight: block,
  pos: vec2(15, 15),
  tiles: {
    "=": () => [
      rect(block, block), 
      color(100, 0, 0), 
      anchor("center"),
      area({
        scale: 0.5,
      }), 
      "wall"
    ],
  },
}

const directions = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
}

let currentDirection: string = directions.RIGHT;
let run: boolean = false
let length: number = 3;
let body: GameObj[] = [];

loadSprite("bg", "image/star.png");

scene("game", () => {
  add([
    sprite("bg", {width: MAP[0].length * block, height: MAP.length * block }),
    pos(0, 0)
  ]);

  const map: GameObj = addLevel(MAP, mapConfig);

  function respawnSnake() {
    body.forEach((segment) => {
      destroy(segment);
    })

    body = [];
    length = 3;

    for (let i = 1; i <= length; i++) {
      body.push(
        add([
          rect(block, block),
          pos(block, block * i),
          color(255, 255, 255),
          area(),
          "snake",
        ])
      );
    }
    currentDirection = directions.DOWN;
  }

  function respawnAll() {
    run = false;
    wait(0.5, () => {
      respawnSnake();
      respawnFood();
      run = true;
    });
  }

  respawnAll();

  onKeyPress("up", () => 
    currentDirection != directions.DOWN && (currentDirection = directions.UP)
  );

  onKeyPress("down", () => 
    currentDirection != directions.UP && (currentDirection = directions.DOWN)
  );

  onKeyPress("left", () => 
    currentDirection != directions.RIGHT && (currentDirection = directions.LEFT)
  );

  onKeyPress("right", () => 
    currentDirection != directions.LEFT && (currentDirection = directions.RIGHT)
  );

  let delay: number = 0.2;
  let timer: number = 0;

  onUpdate(() => {
    if (!run) return;
    timer += dt();
    if (timer < delay) return;
    timer = 0;

    let x: number = 0;
    let y: number = 0;

    switch (currentDirection) {
      case directions.DOWN:
        x = 0;
        y = block;
        break;
      case directions.UP:
        x = 0;
        y = -1 * block;
        break;
      case directions.LEFT:
        x = -1 * block;
        y = 0;
        break;
      case directions.RIGHT:
        x = block;
        y = 0;
        break;
    }

    let head: GameObj = body[body.length - 1];
    head.use(color(255, 255, 255))

    body.push(
      add([
        rect(block, block),
        pos(head.pos.x + x, head.pos.y + y),
        color(255, 0, 0),
        area(),
        "snake",
      ])
    );
    if (body.length > length) {
      let tail: GameObj = body.shift()!;
      destroy(tail);
    }
  });

  let food: GameObj;

  function respawnFood() {
    let newPos = rand(vec2(1, 1), vec2(16, 14));
    newPos.x = Math.floor(newPos.x) + 0.5;
    newPos.y = Math.floor(newPos.y) + 0.5;
    newPos = newPos.scale(block);

    food && destroy(food);

    food = add([
      rect(block, block),
      color(0, 255, 0),
      pos(newPos),
      anchor("center"),
      area({
        scale: 0.2
      }),
      "food",
    ]);
  }

  onCollide("snake", "food", (s: GameObj, f: GameObj) => {
    length++;
    respawnFood();
  });

  onCollide("snake", "wall", (s: GameObj, w: GameObj) => {
    run = false;
    respawnAll();
  });

  // onCollide("snake", "snake", (s: GameObj, t: GameObj) => {
  //   run = false;
  //   respawnAll();
  // })

  const dx = STAGE_WIDTH * 0.5 - STAGE_WIDTH * STAGE_SCALE * 0.5;
  const dy = STAGE_HEIGHT * 0.5 - STAGE_HEIGHT * STAGE_SCALE * 0.5;
  camPos(dx + STAGE_WIDTH * STAGE_SCALE * 0.5, dy + STAGE_HEIGHT * STAGE_SCALE * 0.5);
  camScale(STAGE_SCALE, STAGE_SCALE);
});

go("game");
