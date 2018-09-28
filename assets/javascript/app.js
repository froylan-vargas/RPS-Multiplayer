
$(document).ready(function () {

    function start(){
        gettingStoredPlayerName();
    }

    function gettingStoredPlayerName(){
        var playerName = localStorage.getItem('playerName');
        if (playerName.length){
            $('#userLabel').text(`Hello ${playerName}`);
            $('#playerInfo').hide();
            $('#rpsArea').show();
        }
    }
    
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

    $('#playButton').on('click', playHandler);
    start();
});
