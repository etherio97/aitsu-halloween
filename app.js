const firebaseConfig = {
  apiKey: "AIzaSyDpN6ShiRml6DAd-BC7QBpa2COPuhRsSJI",
  authDomain: "beats-breaks.firebaseapp.com",
  databaseURL: "https://beats-breaks-default-rtdb.firebaseio.com",
  projectId: "beats-breaks",
  storageBucket: "beats-breaks.appspot.com",
  messagingSenderId: "157425558847",
  appId: "1:157425558847:web:1423593322466f31471f8a",
  measurementId: "G-2VKFZWTMGH",
};

const app = firebase.initializeApp(firebaseConfig);

function requireAuth() {
  window.database = app.database();

  return new Promise((resolve) => {
    app.auth().onAuthStateChanged((user) => {
      if (user) {
        resolve();
      } else {
        let email = prompt("Input Email");
        let pass = prompt("Input Password");
        app
          .auth()
          .signInWithEmailAndPassword(email, pass)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.error(err);
            alert("Authentication Failed");
          });
      }
    });
  });
}
