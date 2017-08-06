const os = require('os');
const fs = require('fs');
const path = require('path');
const {
  promisify
} = require('util');

/*---------------------- Constants ----------------------------*/

const OUT_DIR = path.join(os.homedir(), 'DB');
fs.access(
  OUT_DIR,
  fs.constants.R_OK | fs.constants.W_OK,
  err => {
    if (err) {
      fs.mkdir(
        OUT_DIR,
        0o760,
        err => {
          if (err) console.log(`Failed to create output dir ${OUT_DIR} : ${err}`)
        }
      )
    }
  }
);

/*---------------------- Exports -------------------------------*/

module.exports.store = store;
module.exports.findRefs = findRefs;

/*---------------------- Varables ------------------------------*/


/*---------------------- Methods -------------------------------*/

function composeFileName(page) {
  return page.address.replace(/\W/g, "_");
}

function store(page) {
  let fileName = composeFileName(page);
  const { address, title, links } = page;
  fs.writeFile(
    path.join(OUT_DIR, fileName),
    JSON.stringify(page),
    err => {
      if (err) console.log(`error while saving ${address} in ${fileName} : ${err}`);
    }
  );
}

async function findRefs(url) {
  let files = await getFiles(OUT_DIR);
  console.log(files);
  return files.map(filename => fs.readFileSync(filename , 'utf8')).map(JSON.parse).filter(obj => obj.links).filter(obj => obj.links.includes(url)).map(obj => obj.address);
}

async function getFiles(dir) {
  const readdir = promisify(fs.readdir);
  const rename = promisify(fs.rename);
  const stat = promisify(fs.stat);

  var subdirs = await new Promise((res, rej) => fs.readdir(dir, (err, files) => files ? res(files) : res([])));
  const files = await Promise.all(subdirs.map(async(subdir) => {
    const res = path.resolve(dir, subdir);
    return (await stat(res)).isDirectory() ? getFiles(res) : res;
  }));
  return files.reduce((a, f) => a.concat(f), []);
}
