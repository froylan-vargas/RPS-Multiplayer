var isHost = false;
var playerName = '';
var currentGameKey = '';
var currentModality = '';

function start() {
    show('playerInfo');
}

//Handlers
function enterHandler() {
    playerName = $('#nameInput').val().trim();
    if (playerName.length) {
        displayAfterEnter(playerName);
        updateRecord(`/connections/${userKey}`, {
            playerName,
            available: true
        });
    } else {
        alert("You must enter a player name");
    }
}

function playHandler() {
    isHost = true;
    var opponentKey = $(this)[0].parentElement.getAttribute("data-value");
    var modality = $(`div[data-value='${opponentKey}'] select`).val();

    updateRecord(`/connections/${userKey}`, {
        available: false
    });
    updateRecord(`/connections/${opponentKey}`, {
        available: false
    });

    var game = createGameObject(userKey, opponentKey, modality);
    pushRecord("/games", game);
}

function userChoiceHandler() {
    var selectedValue = getAttribute(this, 'data-value');
    if (isHost) {
        updateRecord(`/games/${currentGameKey}/hostChoice`, selectedValue);
    } else {
        updateRecord(`/games/${currentGameKey}/opponentChoice`, selectedValue);
    }
    updateRecord(`/games/${currentGameKey}/change`, 'game');
}

function sendMessageHandler() {
    var message = getInputValue('messageInput');
    if (message) {
        updateRecord(`/games/${currentGameKey}/chat`, {
            lastMessage: message,
            isHost,
            playerName
        });
        updateRecord(`/games/${currentGameKey}/change`, 'chat');
        cleanInputValue('messageInput');
    }
}

function endGameHandler() {
    removeRecord(`/games/${currentGameKey}`);
}

function nextGameHandler(){
    setAttribute('.selectedImage','src','');
    changeText('gameResult', '');
    hide('endGameButton');
    hide('nextGameButton');
    hide('selectionsDiv');
    show('optionsDiv');
}

//fireBaseHandlers
function actionsConnected(connections) {
    connections.forEach(connection => {
        if (connection.val().playerName)
            createOpponentElement(connection);
    });
}

function actionsConnectionUpdated(connection) {
    if (connection.val().playerName !== playerName
        && connection.val().available) {
        createOpponentElement(connection);
    } else if (!connection.val().available) {
        destroyOpponentElement(connection);
        if (connection.key === userKey)
            displayAfterOpponentSelected();
    }
}

function actionsConnectionLost(connection) {
    destroyOpponentElement(connection);
}

function getDisconnectionInfo(connection) {
    var returnId = '';
    var userinGame = false;
    if (currentGameKey) {
        var connectionKey = connection.key;
        var currentGame = getRecord(`/games/${currentGameKey}`);
        var hostId = currentGame.val().host.id;
        var opponentId = currentGame.val().opponent.id;
        if (hostId === connectionKey) {
            userinGame = true;
            returnId = opponentId;
        } else if (opponentId === connectionKey) {
            userinGame = true;
            returnId = hostId;
        }
    }
    return { isUserInGame: userinGame, opponentId: returnId };
}

function actionsGameCreated(game) {
    if (isHost && userKey === game.val().host.id
        || userKey === game.val().opponent.id) {
        gameCreatedAssignments(game);
    }
}

function actionsUserSelection(game) {
    if (game.key === currentGameKey) {
        updateRecord(`/games/${currentGameKey}/change`, '');
        const { hostChoice, opponentChoice } = game.val();

        if (hostChoice && opponentChoice) {
            displayUserChoiceActions();
            setAttribute('#hostChoice', 'src', `./assets/images/${hostChoice}.png`);
            setAttribute('#oponentChoice', 'src', `./assets/images/${opponentChoice}.png`);
            updateRecord(`/games/${currentGameKey}/hostChoice`, '');
            updateRecord(`/games/${currentGameKey}/opponentChoice`, '');
            ValidateWinner(hostChoice, opponentChoice, game);
        } else if (hostChoice && isHost) {
            displayUserChoiceActions();
            setAttribute('#hostChoice', 'src', `./assets/images/${hostChoice}.png`);
        } else if (opponentChoice && !isHost) {
            displayUserChoiceActions();
            setAttribute('#oponentChoice', 'src', `./assets/images/${opponentChoice}.png`);
        }
    }
}

function actionsWinUser(game) {    
    if (game.key === currentGameKey) {
        var hostWins = game.val().host.wins;
        var opponentWins = game.val().opponent.wins;
        updateRecord(`/games/${currentGameKey}/change`, '');
        if (currentModality === "one"){
            show('endGameButton');    
        } else if (currentModality === "twoOthree"){
            if (hostWins < 2 && opponentWins < 2){
                show('nextGameButton');
            } else {
                show('endGameButton');
            }
        } else {
            show('nextGameButton');
            show('endGameButton');
        }
        show('wins');
        show('losts');
        if (isHost) {
            changeText('wins', `Your wins: ${hostWins}`);
            changeText('losts', `Opponent wins: ${opponentWins}`);
        } else {
            changeText('wins', `Your wins: ${opponentWins}`);
            changeText('losts', `Opponent wins: ${hostWins}`);
        }
    }
}

function userInGameDisconnected(opponentId) {
    if (opponentId === userKey) {
        hide('optionsDiv');
        hide('chatArea');
        show('selectionsDiv');
        show('gameResults');
        show('endGameButton');
        printGameResult('Opponent left the game');
    }
}

function actionsGameRemoved(game) {
    if (game.key === currentGameKey) {
        updateRecord(`/connections/${userKey}`, {
            playerName,
            available: true
        });
        isHost = false;
        currentGameKey = '';
        currentModality = '';
        hide('gameContainer');
        show('availableOponents');
    }
}

function actionsChatMessage(game) {
    if (game.key === currentGameKey) {
        updateRecord(`/games/${currentGameKey}/change`, '');
        var chatArea = $('#chat');
        const { lastMessage, isHost, playerName } = game.val().chat;
        var newMessage = createMessageElement(lastMessage, isHost, playerName);
        cleanInputValue('messageInput');
        chatArea.append(newMessage);
    }
}

//destroyElements
function destroyOpponentElement(connection) {
    const { key } = connection;
    $(`div[data-value='${key}']`).remove();
}

//createElements
function createOpponentElement(connection) {
    var key = connection.key;
    var opponentDiv = $('<div>').addClass("mb-3 rowDirection").attr("data-value", key);
    var userName = $('<span>').addClass("userAvailableName mr-sm-5 mr-2").text(connection.val().playerName);
    var oneOption = $('<option>').text("One Game").attr("value", "one");
    var twoOthreeOption = $('<option>').text("Two out of three").attr("value", "twoOthree");
    var infinite = $('<option>').text("Infinite").attr("value", "infinite");
    var modalitySelect = $('<select>').addClass("mr-sm-5 mr-2");
    modalitySelect.append(oneOption, twoOthreeOption, infinite);
    var playButton = $('<button>').addClass("btn btn-success").text("Play!").attr("type", "button")
        .on("click", playHandler);
    opponentDiv.append(userName, modalitySelect, playButton);
    $('#oponentsList').append(opponentDiv);
}

function createMessageElement(message, isHost, playerName) {
    var newMessage = $('<p>');
    newMessage.text(`${playerName}: ${message}`);
    if (isHost) {
        newMessage.addClass('hostMessage');
    } else {
        newMessage.addClass('oponentMessage');
    }
    return newMessage;
}


//Helpers
function cleanInputValue(element) {
    $(`#${element}`).val('');
}

function setAttribute(element, attr, value) {
    $(element).attr(attr, value);
}

function getInputValue(element) {
    return $(`#${element}`).val();
}

function changeText(element, value) {
    $(`#${element}`).text(value);
}

function show(element) {
    $(`#${element}`).show();
}

function hide(element) {
    $(`#${element}`).hide();
}

function getAttribute(element, attr) {
    return $(element).attr(attr);
}

function gameCreatedAssignments(game) {
    currentGameKey = game.key;
    currentModality = game.val().modality;
}

function ValidateWinner(hostChoice, enemyChoice, game) {
    var hostWins = game.val().host.wins;
    var opponentWins = game.val().opponent.wins;
    var hostResult = '';
    if ((hostChoice === 'rock' && enemyChoice === 'scissors')
        || (hostChoice === 'paper' && enemyChoice === 'rock')
        || (hostChoice === 'scissors' && enemyChoice === 'paper')) {
        hostResult = 'You win!';
        opponentResult = 'You loose';
        hostWins++;
    } else if (hostChoice === enemyChoice) {
        hostResult = 'Tie Game';
        opponentResult = 'Tie Game';
    } else {
        hostResult = 'You lose!';
        opponentResult = 'You win';
        opponentWins++;
    }
    isHost ? printGameResult(hostResult) : printGameResult(opponentResult);

    if (hostResult === 'You win!') {
        updateRecord(`/games/${currentGameKey}/host/wins`, hostWins)
    } else if (hostResult === 'You lose!') {
        updateRecord(`/games/${currentGameKey}/opponent/wins`, opponentWins)
    }
    updateRecord(`/games/${currentGameKey}/change`, 'wins');
}

function createGameObject(userKey, opponentKey, modality) {
    return {
        modality,
        hostChoice: '',
        opponentChoice: '',
        host: {
            id: userKey,
            wins: 0
        },
        opponent: {
            id: opponentKey,
            wins: 0
        },
        chat: {
            isHost: false,
            playerName: '',
            lastMessage: ''
        },
        change: ''
    }
}

//Display
function displayAfterOpponentSelected() {
    show("gameContainer");
    show('rpsArea');
    show('chatArea');
    hide('availableOponents');
    cleanPreviousGames();
}

function cleanPreviousGames() {
    show('optionsDiv');
    hide('selectionsDiv');
    $('#chat').empty();
    setAttribute(".selectedImage", 'src', '');
    hide('nextGameButton');
    hide('endGameButton')
    changeText('gameResult', '');
    hide('wins');
    hide('losts');
    changeText('wins','');
    changeText('losts','');
}

function displayAfterEnter() {
    changeText('userLabel', `Hello ${playerName}`);
    show('availableOponents');
    hide('playerInfo');
}

function printGameResult(message) {
    $('#gameResult').text(message);
}

function displayUserChoiceActions() {
    hide('optionsDiv');
    show('selectionsDiv');
    printGameResult("Waiting for opponent...")
}

//GameEvents
start();

//Bindings
$(document).ready(start);
$('#playButton').on('click', enterHandler);
$('#sendMessageButton').on('click', sendMessageHandler);
$('#endGameButton').on('click', endGameHandler);
$('#nextGameButton').on('click', nextGameHandler);
$('.options').on('click', userChoiceHandler);