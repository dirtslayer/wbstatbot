const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const axios = require('axios').default;
const jsdom = require('jsdom');
const { JSDOM } = jsdom;



async function getpage(pid) {
    try {
        return await axios.get('https://stats.warbrokers.io/players/i/' + pid);
    } catch (error) {
        return Promise.reject( console.log(error));
    }
}

const xpathfor = {
    "Name": '/html/body/div[2]/div[1]/div/text()',
    "Kills": '//*[@id="player-details-summary-grid"]/div[1]/div[2]',
    "Deaths": '//*[@id="player-details-summary-grid"]/div[2]/div[2]',
    "wk": '//*[@id="player-details-summary-grid"]/div[4]/div[2]',
    "vk": '//*[@id="player-details-summary-grid"]/div[5]/div[2]',
    "dd": '//*[@id="player-details-summary-grid"]/div[6]/div[2]',
    "xp": '//*[@id="player-details-summary-grid"]/div[7]/div[2]',
    "hs": '//*[@id="player-details-summary-grid"]/div[8]/div[2]',
    "brw": '//*[@id="player-details-summary-grid"]/div[9]/div[2]',
    "dmw": '//*[@id="player-details-summary-grid"]/div[10]/div[2]',
    "mlw": '//*[@id="player-details-summary-grid"]/div[11]/div[2]',
    "pdw": '//*[@id="player-details-summary-grid"]/div[12]/div[2]',
    "vew": '//*[@id="player-details-summary-grid"]/div[13]/div[2]'
};

function trimfixnode(v) {
    var toret = ''; 
    if (v._value.nodes[0].innerHTML)
        toret = v._value.nodes[0].innerHTML;
    else
        toret = v._value.nodes[0].textContent;
    return toret.trim().replace(/\n/g,''); 
}

async function getresult(p) {

console.log('getresult ' + p);
    const page = await getpage(p);
    const dom = new JSDOM(page.data);
    const doc = dom.window.document;

medalstext = '';
outputobj = {
    "Date": Date.now(),
    "PID" : p,

    "Name": "unset",
    "Kills": "unset",
    "Deaths": "unset",

    "wk": "unset", // "Weapon Kills"
    "vk": "unset", // "Vehicle Kills"
    "dd": "unset", // "Damage Dealt"
    "xp": "unset", // "Experience"
    "hs": "unset", // "Head Shots"
    "brw": "unset", // "Battle Royale Wins"
    "dmw": "unset", //"Death Match Wins"
    "mlw": "unset", //"Missile Launch Wins"
    "pdw": "unset", // "Package Drop Wins"
    "vew": "unset", //"Vehicle Escort Wins"

    "Medals" : ""
};
    
// regular stats section 
        for (var xpath in xpathfor) {
            val = doc.evaluate(xpathfor[xpath], doc, null, 0, null);
            outputobj[xpath] = trimfixnode(val);
        }
    

 // daily medals section   
    dailys_xp = "//*[@class='player-details-daily-circle-container']";
    dailys_node = doc.evaluate(dailys_xp, doc, null, 0, null);
    var node = null;
    node = dailys_node.iterateNext();
    while ( node )  {
        // place, category
        medalstext += node.children[0].textContent + ' ' + node.children[1].children[0].textContent + '\n';
        node = dailys_node.iterateNext();
    }
    outputobj["Medals"] = medalstext;


    return outputobj;
    
}


const runtimeOpts = {
    timeoutSeconds: 539,
    memory: '1GB'
  }



// List Players


async function listPlayers() {
    var toretc = '';
    //const results = [];

    const db = admin.firestore();
    const snapshot = await db.collection('players').get();
    snapshot.forEach(async (doc) => {
        // toretc += doc.id ;
        // toretc +=  JSON.stringify(doc.data());
        toretc += doc.data().pid + ' ' + doc.data().name;
        toretc += '\n'

    });
    return toretc;
}

exports.lp = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    
    var torettext = await listPlayers();
    response.contentType("text/plain");
    response.send(torettext);

    
    
 });


 // Snapshot All

async function snapShotAll() {
    toretc = '';
    const results = [];

    const db = admin.firestore();

    const snapshot = await db.collection('players').get();
    snapshot.forEach(async (doc) => {
        // toretc += doc.id ;
        //toretc +=  JSON.stringify(doc.data());
        toretc += doc.data().pid;
        toretc += '\n'

        var pid = doc.data().pid;

        results.push(getresult(pid));

        //toretc += result;

    });

    var toretobj = await Promise.all(results);

    for (var key in toretobj) {
        if (toretobj.hasOwnProperty(key)) {

            results.push(db.collection('snapshots').add(toretobj[key]));
        }
    }
    var toret = await Promise.all(results);
    
    return JSON.stringify(toretobj);
    
}


 exports.snapshotall = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    
    var torettext = await snapShotAll();
    response.contentType("text/plain");
    response.send(torettext);

    return null;
    
 });

async function lastsnapshotfor(PID) {
    const db = admin.firestore();
    const snapshotsRef = db.collection('snapshots');
    const latestsnapRes = await snapshotsRef.where('PID', '==', PID).orderBy('Date','desc').limit(1).get();  //.limit(1).get();
    var results = [];

    if (latestsnapRes.empty) {
        console.log('No matching documents.');
        return;
      }  
    latestsnapRes.forEach(doc => {
        //console.log(doc.id, '=>', doc.data());
        results.push(doc.data());
    });
    //console.log(JSON.stringify(results[0]));

   // console.log( typeof results[0] );

    return results[0];
}

 exports.lastsnapshotfor = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {   
    var tosend = '';
    var PID = request.query.PID;
   //var PID = '5cfff5a6d142af95483e39b8';
    response.contentType("application/json");
    

    var respobj = await lastsnapshotfor(PID);
   
     response.send(JSON.stringify(respobj));   


 });

 exports.lastsnapall = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
   // var toretc = '';
    const results = [];

    const db = admin.firestore();
    const snapshot = await db.collection('players').get();
    snapshot.forEach(async (doc) => {
        // toretc += doc.id ;
        //toretc +=  JSON.stringify(doc.data());
        results.push(lastsnapshotfor(doc.data().pid) );        
    });
   
    var toret = await Promise.all(results);
    response.contentType("text/plain");
    response.send(toret);   
    
    
 });

 exports.metalurgy = functions.runWith(runtimeOpts).https.onRequest( async (request, response) => {
    var toretc = '';
    const results = [];
    
    const db = admin.firestore();
    const snapshot = await db.collection('players').get();
    snapshot.forEach(async (doc) => {
        // toretc += doc.id ;
        //toretc +=  JSON.stringify(doc.data());
        results.push(lastsnapshotfor(doc.data().pid) );        
    });
   
    var toret = await Promise.all(results);
    
    var x;

    for (x of toret) {
        if (x.Medals !== '') {
        toretc += x.Name;
        toretc += '\n';
        toretc += x.Medals;
        toretc += '\n';
        }
    }

    
    response.contentType("text/plain");
    response.send('\n' + toretc);


     
  });


  exports.snapshotallsched = functions.runWith(runtimeOpts).pubsub.schedule('every 10 minutes from 5:00 to 23:59').onRun( async (context) => {
    var torettext = await snapShotAll();
   // response.contentType("text/plain");
    //response.send(torettext);

    return null;
  });