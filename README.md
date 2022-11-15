# RGTI-WebGL

Start server with node command: "node bin/server.js". Go to "http://localhost:3000/".

Za uporabo obj2json:
pri exportanju iz blenderja oznacis: selection only (ce noces luci pa kamere), pod geometry: triangulate faces (ali neki podobnega s trikotniki), write normals
Za uporabo:
1. v index.html odkomentiras script
2. v lib/obj2json spremenis ime fajla/path do njega
3. nrdis nov .json file in notri prilimas console log k ma vertices, normals, textcoords in indices
4. nazaj zakomentiras scene da ne laufa avtomaticno script
