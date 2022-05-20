const fs = require("fs");
const crypto = require("crypto");

const dirName = "remote";
const oldJsonName = "remotecache.vdf";
const newJsonName = "new_remotecache.vdf";

let oldJsonFile = fs.readFileSync(oldJsonName, "utf-8");
//to JSON
oldJsonFile = toJSON(oldJsonFile);
// console.log(oldJsonFile);
const oldJsonObj = JSON.parse(oldJsonFile);
// console.log(oldJsonObj);
for (let fname of fs.readdirSync(dirName)) {
    // console.log(fname);
    let saveObj = JSON.parse(JSON.stringify(oldJsonObj["00.SAV"]));
    let file = fs.readFileSync(dirName + "/" + fname);
    // console.log(file.length);
    saveObj["size"] = file.length.toString();
    let sha1sum = crypto.createHash('sha1').update(file).digest("hex");
    // console.log(sha1sum);
    saveObj["sha"] = sha1sum;
    oldJsonObj[fname] = saveObj;
}
let finalJson = JSON.stringify(oldJsonObj, null, "\t");
fs.writeFileSync(newJsonName, toVDF(finalJson));

function toJSON(oldJsonFile) {
    // "\t\t	":
    //
    // "\n\t"	",\n\t"
    //
    // "\n\t\t"	",\n\t\t"
    //
    // {	:{
    // }	},
    oldJsonFile = oldJsonFile.toString().replace(/"\t\t/g, "\":");
    oldJsonFile = oldJsonFile.toString().replace(/"\n\t"/g, "\",\n\t\"");
    oldJsonFile = oldJsonFile.toString().replace(/"\n\t\t"/g, "\",\n\t\t\"");
    oldJsonFile = oldJsonFile.toString().replace(/\t{/g, "\t:{");
    oldJsonFile = oldJsonFile.toString().replace(/\t}\n\t"/g, "\t},\n\t\"");
    return oldJsonFile;
}

function toVDF(oldJsonFile) {
    // "\t\t	":
    //
    // "\n\t"	",\n\t"
    //
    // "\n\t\t"	",\n\t\t"
    //
    // {	:{
    // }	},
    oldJsonFile = oldJsonFile.toString().replace(/: "/g, "\t\t\"");
    oldJsonFile = oldJsonFile.toString().replace(/",\n\t\t"/g, "\"\n\t\t\"");
    oldJsonFile = oldJsonFile.toString().replace(/",\n\t"/g, "\"\n\t\"");
    oldJsonFile = oldJsonFile.toString().replace(/: {/g, "\n\t{");
    oldJsonFile = oldJsonFile.toString().replace(/},/g, "}");
    return oldJsonFile;
}