const cheerio = require("cheerio");
const _ = require('lodash');
const URL = require('url');

/*---------- constructor -----------------*/

function Page(url, body) {
  this.address = url;
  this.url = new URL.URL(url);
  this.body = body;
  this.title = body("title").text();

  const extractLinks = (url, body) =>
    body('a')
    .map((i, elem) => body(elem).attr("href"))
    .get()
    .map(refUrl => {
      return refUrl.startsWith("http") ? refUrl : URL.resolve(url, refUrl).toString()
    });

  this.links = extractLinks(url, body);
}

/*---------- exports ----------------------*/

module.exports = Page;
