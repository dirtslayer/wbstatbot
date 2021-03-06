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

  function loadPlayers() {
    firebase.firestore().collection('players').get().then(
      function (res) {
        res.forEach( function (doc) {
          console.log('load players' + doc.data());
          var player = doc.data();
          displayPlayer(doc.id, player.timestamp, player.name,
            player.pid);

        });
      }
    );
  } 

  function deletePlayer(id) {
    var div = document.getElementById(id);
   
    if (div) {
      div.parentNode.removeChild(div);
    }
  }

  var PLAYER_TEMPLATE =
    '<li>' +
    
      '<div class="player"></div>' +
      '<div class="name"></div>' +
      '<div class="stats"></div>' + 
      '<div style="height:300px"></div></li>';
    
      
  function createAndInsertPlayer(id, timestamp) {
    const container = document.createElement('div');
    container.innerHTML = PLAYER_TEMPLATE;

    const li = container.firstChild;
    li.setAttribute('id', id);

    const chartele = li.lastChild;
    chartele.setAttribute('class','chart'+id); 

    
  
    // If timestamp is null, assume we've gotten a brand new message.
    // https://stackoverflow.com/a/47781432/4816918
    timestamp = timestamp ? timestamp.toMillis() : Date.now();
    li.setAttribute('timestamp', timestamp);
  
    // figure out where to insert new message
    const existingPlayers = playerListElement.children;
    if (existingPlayers.length === 0) {
      playerListElement.appendChild(li);
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
  
      playerListElement.insertBefore(li, playerListNode);
    }
  
    return li;
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
    
   
  }
  

var playerListElement = document.getElementById('pl-ul');

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
