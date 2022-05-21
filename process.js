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
let newChangeNumber = parseInt(oldJsonObj["ChangeNumber"]) + 1;
oldJsonObj["ChangeNumber"] = newChangeNumber.toString();
for (let fname of fs.readdirSync(dirName)) {
    if (fname === "00.SAV") {
        continue;
    }
    // console.log(fname);
    let saveObj = JSON.parse(JSON.stringify(oldJsonObj["00.SAV"]));
    saveObj["syncstate"] = "1";//1:和云端文件一致 3：和云端文件不一致
    saveObj["persiststate"] = "1";//0:云端同步过 1：云端未同步过
    let file = fs.readFileSync(dirName + "/" + fname);
    // console.log(file.length);
    saveObj["size"] = file.length.toString();
    let sha1sum = crypto.createHash('sha1').update(file).digest("hex");
    // console.log(sha1sum);
    saveObj["sha"] = sha1sum;
    //reset time
    let timeStamp = Math.floor(Date.now() / 1000);
    saveObj["localtime"] = timeStamp.toString();
    saveObj["time"] = timeStamp.toString();
    saveObj["remotetime"] = "0";
    oldJsonObj[fname] = saveObj;
}
let finalJson = JSON.stringify(oldJsonObj, null, "\t");
fs.writeFileSync(newJsonName, toVDF(finalJson));

function toJSON(oldJsonFile) {
    //fix \r\n
    oldJsonFile = oldJsonFile.toString().replace(/\r\n/g, "\n");
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