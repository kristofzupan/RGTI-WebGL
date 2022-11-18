const getFileContents = async (filename) => {
    const file = await fetch(filename);
    const body = await file.text();
    return body;
};

const stringsToNumbers = (strings) => {
    const numbers = [];
    for (const str of strings) {
        numbers.push(parseFloat(str))
    }
    return numbers;
};

const parseFile = (fileContents) => {
    const positions = [];
    const textCoords = [];
    const normals = [];
    const indices2d = [];

    const arrayBufferSource = [];

    const lines = fileContents.split('\n');
    for (const line of lines) {
        const [ command, ...values ] = line.split(' ', 4);
        //console.log(values);

        if (command === 'v') {
            positions.push(stringsToNumbers(values));
        }
        else if (command === 'vt') {
            textCoords.push(stringsToNumbers(values));
        }
         else if (command === 'vn') {
            normals.push(stringsToNumbers(values));
        }

        else if (command === 'f') {
            for (const group of values) {
                const [ positionIndex, textCoordIndex, normalIndex ] = stringsToNumbers(group.split('/'))
                
               /* arrayBufferSource.push(...positions[positionIndex - 1]);
                arrayBufferSource.push(...normals[normalIndex - 1]);
                arrayBufferSource.push(...textCoords[textCoordIndex - 1]); */
                indices2d.push(positionIndex - 1);

            }
            
        }
    }

    const indices = [];

    for (var i = 0; i < indices2d.length; i += 3) {
        indices[i / 3] = [];
        indices[i / 3].push(indices2d[i], indices2d[i + 1], indices2d[i + 2]);
    }

    return JSON.stringify({ vertices:  positions.flat(), normals: normals.flat(), textCoords: textCoords.flat(), indices: indices2d},null, 0);//.replaceAll("]", ' '));
};


const main = async () => {
    //tu spremenis ime fajla, json kopiras iz console loga
    const fileContents = await getFileContents('../models/obj/untitled.obj');
    const json = parseFile(fileContents);
    //odkomentiri console log, da dobis v konzoli json
    //console.log(json);

    
};

main();