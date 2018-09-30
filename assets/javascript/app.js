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
    var opponentName = $(`div[data-value='${opponentKey}'] span`).text();
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

function endGameHandler(){
    console.log('Im here');
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
            ValidateWinner(hostChoice, opponentChoice);
            updateRecord(`/games/${currentGameKey}/hostChoice`, '');
            updateRecord(`/games/${currentGameKey}/opponentChoice`, '');
            if (currentModality === 'one'){
                show("endGameButton");
            }
        } else if (hostChoice && isHost) {
            displayUserChoiceActions();
            setAttribute('#hostChoice', 'src', `./assets/images/${hostChoice}.png`);
        } else if (opponentChoice && !isHost) {
            displayUserChoiceActions();
            setAttribute('#oponentChoice', 'src', `./assets/images/${opponentChoice}.png`);
        }
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
    var userName = $('<span>').addClass("userAvailableName mr-5").text(connection.val().playerName);
    var oneOption = $('<option>').text("One Game").attr("value", "one");
    var twoOthreeOption = $('<option>').text("Two out of three").attr("value", "twoOthree");
    var modalitySelect = $('<select>').addClass("mr-5");
    modalitySelect.append(oneOption, twoOthreeOption);
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

function ValidateWinner(hostChoice, enemyChoice) {
    var hostResult = '';
    var opponentResult = '';
    if ((hostChoice === 'rock' && enemyChoice === 'scissors')
        || (hostChoice === 'paper' && enemyChoice === 'rock')
        || (hostChoice === 'scissors' && enemyChoice === 'paper')) {
        hostResult = 'You win';
        opponentResult = 'You loose';
    } else if (hostChoice === enemyChoice) {
        hostResult = 'Tide Game';
        opponentResult = 'Tide Game';
    } else {
        hostResult = 'You lose!';
        opponentResult = 'You win';
    }
    isHost ? printGameResult(hostResult) : printGameResult(opponentResult);
}

function createGameObject(userKey, opponentKey, modality) {
    return {
        modality,
        hostChoice: '',
        opponentChoice: '',
        host: {
            id: userKey,
        },
        opponent: {
            id: opponentKey,
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
$('.options').on('click', userChoiceHandler);