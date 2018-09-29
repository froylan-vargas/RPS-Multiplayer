
$(document).ready(function () {

    var isHostChoose = false;
    var playerName = '';

    function start() {
        gettingStoredPlayerName();
    }

    //Display

    function gettingStoredPlayerName() {
        playerName = localStorage.getItem('playerName');
        if (playerName) {
            displayAfterPlayerName(playerName);
        } else {
            show('playerInfo');
        }
    }

    function displayAfterPlayerName(playerName) {
        changeText('userLabel',`Hello ${playerName}`);
        show("gameContainer");
        show('rpsArea');
        show('chatArea');
        hide('playerInfo');
    }

    //Handlers
    function playHandler() {
        playerName = $('#nameInput').val().trim();
        if (playerName.length) {
            localStorage.setItem('playerName', playerName);
            displayAfterPlayerName(playerName);
        } else {
            alert("You must enter a player name");
        }
    }

    function userChoiceHandler() {
        var selectedValue = getAttribute(this, 'data-value');
        var hostElement = '#hostChoice';
        if (!isHostChoose) {
            isHostChoose = true;
            show('selectionsDiv');
            setAttribute(hostElement, 'src', `./assets/images/${selectedValue}.png`);
            setAttribute(hostElement, 'data-value', selectedValue);
        } else {
            const hostChoice = getAttribute(hostElement, 'data-value');
            setAttribute('#oponentChoice', 'src', `./assets/images/${selectedValue}.png`);
            ValidateWinner(hostChoice, selectedValue);
        }
    }

    function sendMessageHandler(){
        var message = getInputValue('messageInput');
        var chat = $('#chat');
        if (message){
          var newMessage = createMessageElement(message);
          cleanInputValue('messageInput');
          chat.append(newMessage);
        } 
    }

    //Helpers
    function createMessageElement(message, isHost = true){
        var newMessage = $('<p>');
        newMessage.text(`${playerName}: ${message}`);
        if (isHost){
            newMessage.addClass('hostMessage');
        } else {
            newMessage.addClass('oponentMessage');
        }
        return newMessage;
    }

    function cleanInputValue(element){
        $(`#${element}`).val('');
    }

    function setAttribute(element, attr, value) {
        $(element).attr(attr, value);
    }

    function getInputValue(element){
        return $(`#${element}`).val();
    }

    function changeText(element,value){
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

    function ValidateWinner(hostChoice, enemyChoice) {
        var result = '';
        if ((hostChoice === 'rock' && enemyChoice === 'scissors')
            || (hostChoice === 'paper' && enemyChoice === 'rock')
            || (hostChoice === 'scissors' && enemyChoice === 'paper')) {
            result = 'You win';
        } else if (hostChoice === enemyChoice) {
            result = 'Tide Game';
        } else {
            result = 'You lose!'
        }
        printGameResult(result);
    }

    function printGameResult(message) {
        $('#gameResult').text(message);
    }

    //Bindings
    $('#playButton').on('click', playHandler);
    $('#sendMessageButton').on('click', sendMessageHandler);
    $('.options').on('click', userChoiceHandler);
    
    //GameEvents
    start();
});
