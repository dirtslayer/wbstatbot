/*

function signIn() {
    // alert('TODO: Implement Google Sign-In');
     // TODO 1: Sign in Firebase with credential from the Google user.
     var provider = new firebase.auth.GoogleAuthProvider();
     //var provider = new firebase.auth.GoogleAuthProvider();
     firebase.auth().signInWithPopup(provider);
   }
   
   // Signs-out of Friendly Chat.
   function signOut() {
     // TODO 2: Sign out of Firebase.
     firebase.auth().signOut();
   }

*/

function initFirebaseAuth() {
    firebase.auth().onAuthStateChanged(authStateObserver);
  }


  function authStateObserver(user) {
   /* if (user) { // User is signed in!
      // Get the signed-in user's profile pic and name.
      var profilePicUrl = getProfilePicUrl();
      var userName = getUserName();
  
      // Set the user's profile pic and name.
      userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
      userNameElement.textContent = userName;
  
      // Show user's profile and sign-out button.
      userNameElement.removeAttribute('hidden');
      userPicElement.removeAttribute('hidden');
      signOutButtonElement.removeAttribute('hidden');
  
      // Hide sign-in button.
      signInButtonElement.setAttribute('hidden', 'true');
  
      // We save the Firebase Messaging Device token and enable notifications.
      saveMessagingDeviceToken();
    } else { // User is signed out!
      // Hide user's profile and sign-out button.
      userNameElement.setAttribute('hidden', 'true');
      userPicElement.setAttribute('hidden', 'true');
      signOutButtonElement.setAttribute('hidden', 'true');
  
      // Show sign-in button.
      signInButtonElement.removeAttribute('hidden');
    } */
  }

 function onSnapshotAllSubmit(e) {
   e.preventDefault();
   var query = firebase.firestore()
                    .collection('players')
                    .orderBy('timestamp', 'desc')
                    .limit(50);
    

                    query.onSnapshot(function(snapshot) {
                      snapshot.docChanges().forEach(function(change) {
                        if (change.type === 'removed') {
                          deletePlayer(change.doc.id);
                        } else {
                          var player = change.doc.data();
                          console.log('log: ',change.doc.id, player.timestamp, player.name,
                                         player.pid);
                        }
                      });
                    });

 }


function onPlayerAddSubmit(e) {
    e.preventDefault();
    // Check that the user entered a message and is signed in.
    if (playeraddInputElement.value ) {
      savePlayer(playeraddInputElement.value).then(function() {
        // Clear message text field and re-enable the SEND button.
        // resetMaterialTextfield(messageInputElement);
        console.log('player add clear field');
        playeraddInputElement.value = '';
        
      });
    }
  }








////////////////////////////////////////////////////


//////////////////////////






///////////////////











// todo: change the field called text to pid, and then, test
  function savePlayer(PID) {
    // TODO 7: Push a new message to Firebase.
    return firebase.firestore().collection('players').add({
      name: '',
      pid: PID,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(error) {
      console.error('Error writing new player to database', error);
    });
  }

  function loadPlayers() {
      
    var query = firebase.firestore()
                    .collection('players')
                    .orderBy('timestamp', 'desc')
                    .limit(50);
    
    // Start listening to the query.
    query.onSnapshot(function(snapshot) {
      snapshot.docChanges().forEach(function(change) {
        if (change.type === 'removed') {
          deletePlayer(change.doc.id);
        } else {
          var player = change.doc.data();
          displayPlayer(change.doc.id, player.timestamp, player.name,
                         player.pid);
        }
      });
    });
  }
  function deletePlayer(id) {
    var div = document.getElementById(id);
   
    if (div) {
      div.parentNode.removeChild(div);
    }
  }
  var PLAYER_TEMPLATE =
    '<div class="player-container">' +
      '<div class="player"></div>' +
      '<div class="name"></div>' +
    '</div>';

  function createAndInsertPlayer(id, timestamp) {
    const container = document.createElement('div');
    container.innerHTML = PLAYER_TEMPLATE;
    const div = container.firstChild;
    div.setAttribute('id', id);
  
    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    div.setAttribute('timestamp', timestamp);
  
    // figure out where to insert new message
    const existingPlayers = playerListElement.children;
    if (existingPlayers.length === 0) {
      playerListElement.appendChild(div);
    } else {
      let playerListNode = existingPlayers[0];
  
      while (playerListNode) {
        const playerListNodeTime = playerListNode.getAttribute('timestamp');
  
        if (!playerListNodeTime) {
          throw new Error(
            `Child ${playerListNode.id} has no 'timestamp' attribute`
          );
        }
  
        if (playerListNodeTime > timestamp) {
          break;
        }
  
        playerListNode = playerListNode.nextSibling;
      }
  
      playerListElement.insertBefore(div, playerListNode);
    }
  
    return div;
  }
  
  // Displays a Message in the UI.
  function displayPlayer(id, timestamp, name, text) {
    var div = document.getElementById(id) || createAndInsertPlayer(id, timestamp);
  
  
    div.querySelector('.name').textContent = name;
    var playerElement = div.querySelector('.player');
  
    if (text) { // If the message is text.
      playerElement.textContent = text;
      // Replace all line breaks by <br>.
      playerElement.innerHTML = playerElement.innerHTML.replace(/\n/g, '<br>');
    } else if (imageUrl) { // If the message is an image.
     
     playerElement.innerHTML = '';
    
    }
    // Show the card fading-in and scroll to view the new message.
    
    playeraddInputElement.focus();
  }
  

var playerListElement = document.getElementById('pl-ul');
var playeraddFormElement = document.getElementById('pl-add-form');
var playeraddInputElement = document.getElementById('pl-add-text');
var playeraddsubmitButtonElement = document.getElementById('pl-add-submit');

var snapshotallFormElement = document.getElementById('snapshot-all');
var snapshotallButtonElement = document.getElementById('snapshot-all-submit');

playeraddFormElement.addEventListener('submit',onPlayerAddSubmit);
snapshotallFormElement.addEventListener('submit',onSnapshotAllSubmit);

//initFirebaseAuth();
var app;

function init() {
    try {
        app = firebase.app();
    }
    catch (e) {
        console.error(e);
    }

    loadPlayers();
}
