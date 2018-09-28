
$(document).ready(function () {

    var isHostChoose = false;

    function start(){
        gettingStoredPlayerName();
    }

    function gettingStoredPlayerName(){
        var playerName = localStorage.getItem('playerName');
        if (playerName){
            $('#userLabel').text(`Hello ${playerName}`);
            $('#playerInfo').hide();
            $('#rpsArea').show();
        } else {
            $('#playerInfo').show();
        }
    }
    
    //Handlers
    function playHandler() {
        var playerName = $('#nameInput').val().trim();
        if(playerName.length){
            localStorage.setItem('playerName', playerName);
            $('#userLabel').text(`Hello ${playerName}`);
            $('#playerInfo').hide();
            $('#rpsArea').show();
        } else {
            alert("You must enter a player name");
        }
    }

    function userChoiceHandler() {
        var selectedValue = $(this).attr('data-value');
        if(!isHostChoose){
            isHostChoose = true;
            $('#selectionsDiv').show();
            $('#hostChoice')
                .attr('src',`./assets/images/${selectedValue}.png`)
                .attr('data-value', selectedValue);
        } else {
            $('#oponentChoice').attr('src',`./assets/images/${selectedValue}.png`);
            const hostChoice = $('#hostChoice').attr('data-value');
            ValidateWinner(hostChoice,selectedValue);
        }
    }

    //Helpers
    function ValidateWinner(hostChoice, enemyChoice){
        if((hostChoice === 'rock' && enemyChoice === 'scissors')
        || (hostChoice === 'paper' && enemyChoice === 'rock')
        || (hostChoice === 'scissors' && enemyChoice === 'paper')) {
            $('#gameResult').text('You win');
        } else if (hostChoice === enemyChoice) {
            $('#gameResult').text('Tide Game');
        } else {
            $('#gameResult').text('You loose');
        }
    }

    $('#playButton').on('click', playHandler);
    $('.options').on('click', userChoiceHandler)
    start();
});
