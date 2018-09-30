var config = {
    apiKey: "AIzaSyAgZHBWeEp1QXA8tqDh-kq43cnvFj4Ih1k",
    authDomain: "rps-multiplayer-c0ef6.firebaseapp.com",
    databaseURL: "https://rps-multiplayer-c0ef6.firebaseio.com",
    projectId: "rps-multiplayer-c0ef6",
    storageBucket: "rps-multiplayer-c0ef6.appspot.com",
    messagingSenderId: "289792024556"
};

firebase.initializeApp(config);
var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

var userKey;

//Listeners
//Connection Listeners

//Connected or disconnected
connectedRef.on("value", function (snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        userKey = con.key;
        con.onDisconnect().remove();
    }
});

//Connection updated
database.ref(`/connections`).on("child_changed", function (snap) {
    actionsConnectionUpdated(snap);
});

//DoWhenConnected
database.ref('/connections').once("value", function (snap) {
    actionsConnected(snap);
})

//ConnectionLost
database.ref(`/connections`).on("child_removed", function (snap) {
    actionsConnectionLost(snap);
})

//Games listeners
//New game created
database.ref(`/games`).on("child_added", function (snap) {
    actionsGameCreated(snap);
})

//Game change
database.ref(`/games`).on("child_changed", function (snap) {
    var change = snap.val().change;
    if (change === 'chat') {
        actionsChatMessage(snap);
    } else if (change === 'game'){
        actionsUserSelection(snap);
    }
})

//Helpers
function updateRecord(query, updateElement) {
    database.ref(query).set(updateElement);
}

function pushRecord(query, addElement) {
    database.ref(query).push(addElement);
}