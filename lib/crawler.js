const got = require("got");
const cheerio = require("cheerio");
const _ = require('lodash');
const URL = require('url');

const db = require('../lib/db');
const Page = require('../lib/page');

/*---------------------- Constants ----------------------------*/

const MAX = 10;

/*---------------------- Exports -------------------------------*/

module.exports.traverse = traverse;

/*---------------------- Varables ------------------------------*/

let visited = new Map();

/*---------------------- Methods -------------------------------*/

function acceptUrl(url, parentUrl) {
  let urlObj = new URL.URL(url);
  let parentUrlObj = new URL.URL(parentUrl);
  return urlObj.hostname.toLowerCase() === parentUrlObj.hostname.toLowerCase() &&
    !urlObj.hash;
}

function onDownloadingFinished(page) {
  visited.set(page.address, page.title);
  console.log("DOWNLOADED: " + visited.get(url));

  console.log(page.links.map(link => url + " => " + link).join("\n"));
  db.store(page);
  page.links.filter(refUrl => acceptUrl(refUrl, page.address)).forEach(traverse);
}

function traverse(url) {
  if (visited.has(url) || visited.size >= MAX) {
    console.log('HERE');
    return;
  }

  let body = got(url)
    .then(response => onDownloadingFinished(new Url(url, cheerio.load(response.body))))
    .catch(error => console.error(error));
}

function print() {
  Array.from(visited.entries).map(e => e[0] + " => " + e[1]).forEach(console.log);
  //   console.log(visited);
}

/*------------------------- MAIN ----------------------------------------------------*/
// console.log("TRAVERSE from: " + root);
// traverse(root);
//print();