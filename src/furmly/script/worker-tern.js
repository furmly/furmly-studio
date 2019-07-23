/** Tern web worker, which is used by default
 * This file also contains all files that are needed for the web worker to run (the server can load files on demand, but its messy to have all these files for once peice of ace functionality) *
 *
 *
 * Last updated 4/8/2015
 * Versions:
 *      Acorn: 1.0.1
 *      Tern:  0.10.0
 *
 * NOTE: in order to get latest acorn version you now must get from NPM or manually build Acorn source. Easiest way is to create a new folder and use: npm install acorn
 *
 * NOTE: There is a bug with chrome.fileSystem that makes saving this file (specifically acorn.js) break (messes up UTF-8 encoding). https://code.google.com/p/chromium/issues/detail?id=474183. This file must be saved with a non-chrome app. If saved with a chrome app, then overwrting save wont fix, instead must delete file and save as new file from non-chrome app.
 *
 * NOTE: acorn_csp.js works without eval, but tern still has code that requires eval so there is no reason to use acorn_csp.
 */

// declare global: tern, server
/*jshint maxerr:10000 */

/**
 * this file used in web worker or normal javascript execution
 */

var server_uri = "http://localhost:${port}/api/tern";

self.onmessage = function(e) {
  //console.log('onmessage');
  var data = e.data;
  switch (data.type) {
    case "init":
      break;
    case "add":
      return fetch(`${server_uri}/PROCESSOR`, {
        body: JSON.stringify({ _id: data.name, text: data.text }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
        .then(() => {
          console.log("added doc");
        })
        .catch(e => {
          console.error("failed to add doc ", e);
        });
    case "del":
      return fetch(`${server_uri}/PROCESSOR`, {
        body: JSON.stringify({ _id: data.name }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "DELETE"
      })
        .then(() => {
          console.log("deleted doc");
        })
        .catch(e => {
          console.error("failed to delete doc ", e);
        });
    case "req":
      return fetch(`${server_uri}/request/PROCESSOR`, {
        body: JSON.stringify(data.body),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })
        .then(response => {
          console.log("req completed");
          response.json().then(reqData => {
            postMessage({
              id: data.id,
              body: reqData,
              err: null
            });
          });
        })
        .catch(e => {
          console.error("failed to make req ", e);
          postMessage({
            id: data.id,
            body: null,
            err: e && e.message
          });
        });
    case "getFile":
    case "setDefs":
    case "debug":
    default:
      throw new Error("Unknown message type: " + data.type);
  }
};
