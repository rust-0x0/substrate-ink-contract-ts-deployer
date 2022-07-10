
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const basepath = "/Users/lisheng/mygit/rust0x0/5degrees-protocol-substrate/"
async function execCmd(cmd: String, keyword: String, path: String) {
    let { err, stdout, stderr } = await exec(cmd, { cwd: path });
    if (err) {
        console.error(err);
        // return;
    }
    console.log("========stdout==========", stdout, "========stderr==========", stderr);
    return stdout.substring(stdout.indexOf(keyword) + keyword.length).trim();
}
async function savejson(key: String, value: String, section: String) {
    let jsonfile = "./kv.json";
    let json: any = fs.readFileSync(jsonfile);

    if (json == undefined) {
        json = {};
    } else {
        json = JSON.parse(json);
    }
    if (json[section.toString()] == undefined) {
        json[section.toString()] = {}
    }
    json[section.toString()][key.toString()] = value;
    fs.writeFileSync(jsonfile, JSON.stringify(json));
}
async function getjson(key: String, section: String) {
    let jsonfile = "./kv.json";
    let json: any = fs.readFileSync(jsonfile);

    if (json == undefined) {
        return "";
    }
    json = JSON.parse(json);

    if (json[section.toString()] == undefined) {
        return ""
    }
    return json[section.toString()][key.toString()];

}
const execpath = " /Users/lisheng/Downloads/cargo-contract-1.1.0/target/release/"
async function upload(acc: String, path: String, key: String) {
    const output = await execCmd('cargo-contract contract upload --suri //' + acc, "Code hash", path);
    savejson(key, output, "hash");
    return output;
}
async function instantiate(acc: String, args: String, code_hash: String, path: String, key: String) {
    // let output = await execCmd('cargo-contract contract instantiate --constructor new ' + (args == undefined || args == "" ? "" : " --args " + args) + ' --suri //' + acc + ' --code-hash ' + code_hash, "Contract ", path);
    console.log("instantiate paras=",'cargo-contract contract instantiate --constructor new ' + (args == undefined || args == "" ? "" : " --args " + args) + '  --suri //' + acc, "Contract ", path);
    let output = await execCmd('cargo-contract contract instantiate --constructor new ' + (args == undefined || args == "" ? "" : " --args " + args) + '   --suri //' + acc, "Contract ", path);

    savejson(key, output, "address");
    return output;
}
(async function () {
    if (true) {
        const users = ["Alice", "Bob", "Charlie", "Dave", "Eve", "Ferdie"];
        let pathes = {
            "erc1155": basepath + "erc1155", "five_degrees": basepath + "five_degrees"
        };
        let args = { "erc1155": "", "five_degrees": "'5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL 0xd5f768bbb70d4afc86b404fd767f01a64e4d0ab7f2bd6cd400895adbe79491c2'" }
        let keys = Object.keys(pathes);//.slice(0,7);

        let codehashes: any = [];
        let contractaddresses: any = [];
        let i = 0;
        for (let key of keys) {
            console.log(i, "======para======", users[i], pathes[key as keyof typeof pathes], key);

            if (i == 0) {
                const code_hash = await upload(users[i], pathes[key as keyof typeof pathes], key);
                console.log(i, "======code_hash======", code_hash);

                codehashes.push(code_hash);
                args["five_degrees"] = "1 " + code_hash + "";
            } else {
                const contract_address = await instantiate(users[i], args[key as keyof typeof args], "code_hash", pathes[key as keyof typeof pathes], key);
                contractaddresses.push(contract_address);
                console.log(i, "======contract_address======", contract_address)
            }

            i++;

        }

    }

})();
console.log("============")