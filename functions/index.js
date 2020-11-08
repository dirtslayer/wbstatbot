const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const runtimeOpts = {
    timeoutSeconds: 539,
    memory: '1GB'
  }


exports.lp = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    
    var torettext = 'hello work';
    response.contentType("text/plain");
    response.send(torettext);
    
 });