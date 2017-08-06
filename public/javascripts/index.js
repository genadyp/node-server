window.onload = function() {

  var messages = [];
  var socket = io.connect('http://node-server-nukegluk959791.codeanyapp.com:3700');

  socket.on('message', function(data) {
    if (data) console.log("received: " + data.message);
  });

  var root = document.getElementById("root");
  var crawlButton = document.getElementById("crawl");
  var content = document.getElementById("content");

  crawlButton.onclick = function() {
    var text = root.value;
    console.log("send: " + text);
    socket.emit('crawl', {
      url: text
    });
  };

  var url = document.getElementById("url");
  var refButton = document.getElementById("ref");
  refButton.onclick = function() {
    var text = url.value;
    console.log("send: " + text);
    socket.emit('refs', {
      url: text
    });
  };

  socket.on('refs', function(data) {
    if (!data || !data.refs) {
      return;
    }

    var refTableBody = document.getElementById("ref-table").getElementsByTagName("tbody")[0];
    if (!refTableBody) {
      return;
    }
    console.log(refTableBody);
    refTableBody.querySelectorAll("tbody tr").forEach(e => e.remove());

    for (let ref of data.refs) {
      console.log("received ref: " + ref);
      refTableBody.insertRow(-1).insertCell(0).innerHTML = ref;
    }
  });
}