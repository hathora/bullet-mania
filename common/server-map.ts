import map from "./map.json" assert { type: "json" };

const { tileSize } = map

map.top    *= tileSize
map.left   *= tileSize
map.bottom *= tileSize
map.right  *= tileSize

for(let i = 0; i < map.walls.length; i++) {
    const wall = map.walls[i]

    wall.x      *= tileSize
    wall.y      *= tileSize
    wall.width  *= tileSize
    wall.height *= tileSize
}

export default map
