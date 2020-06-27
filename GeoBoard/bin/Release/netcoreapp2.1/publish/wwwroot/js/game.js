let name = "";
let opponent = "";
let barWidth = 30;
let prevMessage = "";
let runBarInterval;
let p1p = 0;
let p2p = 0;
let playAgainp1 = false;
let playAgainp2 = false;
let gameHasWon = false;
let WinningPlayer = "";
const urlParams = new URLSearchParams(window.location.search);
let sessionId = makeid(8);

let joinedGame = false;

if (urlParams.get('g') != null) {
    sessionId = urlParams.get('g');
    let result = httpGet('/api/game/' + sessionId);
    if (result != "nonExistingGame") {
        opponent = result;
        joinedGame = true;
    } else {
        sessionId = makeid(8);
    }
}

let connection = new signalR.HubConnectionBuilder().withUrl("/gameHub?sessionId=" + sessionId).build();

//Disable 
document.getElementById("chatSend").disabled = true;
document.getElementById("chatInput").disabled = true;

connection.on("ReceiveMessage", function (playerName, message, lastLetter, points) {

    document.getElementById("chatInput").value = null;
    barWidth = 30;
    clearInterval(runBarInterval);

    if (playerName == name) {
        p1p = p1p + points;
        document.getElementById("score1").innerText = p1p;
        document.getElementById("score1Mobile").innerText = p1p;
        if (p1p >= 50) {
            displayMessage(message, "Left");
            playerWon(playerName);
            return;
        }
    } else {
        p2p = p2p + points;
        document.getElementById("score2").innerText = p2p;
        document.getElementById("score2Mobile").innerText = p2p;
        if (p2p >= 50) {
            displayMessage(message, "Right");
            playerWon(playerName);
            return;
        }
    }

    if (message != "") {

        prevMessage = message;
        if (playerName == name) {
            displayMessage(message, "Left");
            switchTurn(playerName, true);
        } else {
            displayMessage(message, "Right");
            switchTurn(playerName, false, lastLetter);
        }

    } else {

        if (playerName == name) {
            switchTurn(playerName, true);
        } else {
            switchTurn(playerName, false, lastLetter);
        }

    }

});

connection.on("PlayerJoined", function (message) {

    if (message != name) {
        opponent = message;
        document.getElementById("name2").innerText = opponent;
        document.getElementById("name2Mobile").innerText = opponent;
        displayMessage("Je tegenstander is: " + message);
        setTimeout(() => { displayMessage("Het spel kan beginnen!"); }, 1000);

        setTimeout(() => {
            connection.invoke("StartGame", sessionId, name).catch(function (err) {
                return console.error(err.toString());
            });
        }, 5000);

    }
});

connection.on("StartGame", function (letter, playerName) {

    clearChat();

    if (playerName == name) {
        displayLetter(letter);
    }

    prevMessage = letter;

    runBarInterval = setInterval(() => { runBar(playerName); }, 10);

}); 

connection.on("NonExistingWord", function (playerName) {

    if (name == playerName) {
        errorAnimation();
    }

});

connection.on("PlayAgain", function (playerName) {

    if (name == playerName) {
        displayMessage("Ja", "Left");
        playAgainp1 = true;

    } else {
        displayMessage("Ja", "Right");
        playAgainp2 = true;
    }

    if (playAgainp1 == true && playAgainp2 == true) {
        restartGame();
    }

});

function restartGame() {

    setTimeout(() => { displayMessage("Het spel kan beginnen!"); }, 1000);

    if (WinningPlayer != name) {
        setTimeout(() => {
            connection.invoke("StartGame", sessionId, name).catch(function (err) {
                return console.error(err.toString());
            });
        }, 3000);
    }

    prevMessage = "";
    runBarInterval;
    p1p = 0;
    p2p = 0;
    playAgainp1 = false;
    playAgainp2 = false;
    gameHasWon = false;
    WinningPlayer = "";
    document.getElementById("score1").innerText = p1p;
    document.getElementById("score1Mobile").innerText = p1p;
    document.getElementById("score2").innerText = p2p;
    document.getElementById("score2Mobile").innerText = p2p;
    document.getElementById("chatInput").value = null;
}

connection.start().then(function () {
    
    setTimeout(() => { displayMessage("Welkom bij Word Game!"); }, 1000);

    if (joinedGame) {
        setTimeout(() => {
            displayMessage("Je bent uitgedaagd door " + opponent + ".");
            document.getElementById("name2").innerText = opponent;
            document.getElementById("name2Mobile").innerText = opponent;
         }, 2000);
    }

    setTimeout(() => {
        displayMessage("Wat is je naam?");
        document.getElementById("chatSend").disabled = false;
        document.getElementById("chatInput").disabled = false;
        document.getElementById("chatInput").focus();
        document.getElementById("chatInput").focus();
    }, 3000);


}).catch(function (err) {
    return console.error(err.toString());
});

function playerWon(playerName) {
    displayWinningMessage(playerName);
    gameHasWon = true;
    WinningPlayer = playerName;

    document.getElementById("wordBarBody").hidden = true;
    document.getElementById("chatSend").disabled = false
    document.getElementById("chatInput").disabled = false;
    document.getElementById("chatInput").focus();
    document.getElementById("wordBarOverlay").style.width = barWidth + "rem";
}

function errorAnimation() {
    document.getElementById("chatInput").style.backgroundColor = "#E57373";

    setTimeout(() => {
        document.getElementById("chatInput").style.backgroundColor = "white";
    }, 500);
}

function clearChat() {

    let chat = document.getElementById("chatScreen");
    while (chat.firstChild) {
        chat.removeChild(chat.firstChild);
    }

}

function switchTurn(playerName, lastPlay, lastLetter) {
    if (lastPlay) {
        document.getElementById("wordBarBody").hidden = true;
        document.getElementById("chatSend").disabled = true;
        document.getElementById("chatInput").disabled = true;
    } else {
        displayLetter(lastLetter)
    }

    runBarInterval = setInterval(() => { runBar(playerName); }, 10);
}

function displayLetter(letter) {
    document.getElementById("wordBarLetter").innerText = letter;
    document.getElementById("wordBarBody").hidden = false;
    document.getElementById("chatSend").disabled = false;
    document.getElementById("chatInput").disabled = false;
    document.getElementById("chatInput").focus();
}

function displayMessage(message, side) {

    sideClass = "chatRight";

    if (side == "Left") {
        sideClass = "chatLeft";
    }

    let chatMessageContainer = document.createElement("div");
    chatMessageContainer.className = "chatMessageContainer";

    let chatMessage = document.createElement("div");

    chatMessage.className = sideClass + " row1 chatMessage";
    chatMessage.append(message);

    chatMessageContainer.appendChild(chatMessage);

    let chatScreen = document.getElementById("chatScreen");

    chatScreen.appendChild(chatMessageContainer);
    chatScreen.scrollTop = chatScreen.scrollHeight;
}

function displayLargeMessage(row1, row2, side) {

    sideClass = "chatRight";

    if (side == "Left") {
        sideClass = "chatLeft";
    }

    let chatMessageContainer = document.createElement("div");
    chatMessageContainer.className = "chatMessageContainer";

    let chatMessage = document.createElement("div");

    chatMessage.className = sideClass + " row2 chatMessage";
    chatMessage.append(row1);

    let br = document.createElement("br");
    chatMessage.appendChild(br);
    chatMessage.append(row2);

    chatMessageContainer.appendChild(chatMessage);

    chatScreen.appendChild(chatMessageContainer);
    chatScreen.scrollTop = chatScreen.scrollHeight;
}

function displayWinningMessage(playerName) {

    let row1 = playerName + " heeft gewonnen!";
    let row2 = "";
    let row3 = "Wil je nog een keer spelen?";
    let row4 = "Type 'ja'";

    let chatMessageContainer = document.createElement("div");
    chatMessageContainer.className = "chatMessageContainer winMessageContainer";

    let chatMessage = document.createElement("div");
    chatMessage.className = " winMessage chatMessage";
    chatMessage.append(row1);

    chatMessage.appendChild(document.createElement("br"));
    chatMessage.append(row2);

    chatMessage.appendChild(document.createElement("br"));
    chatMessage.append(row3);

    chatMessage.appendChild(document.createElement("br"));
    chatMessage.append(row4);

    chatMessageContainer.appendChild(chatMessage);

    chatScreen.appendChild(chatMessageContainer);
    chatScreen.scrollTop = chatScreen.scrollHeight;
}

function sendChat() {

    let input = document.getElementById("chatInput");

    if (gameHasWon == true) {
        if (input.value == "ja" || input.value == "Ja") {
            document.getElementById("chatSend").disabled = true;
            document.getElementById("chatInput").disabled = true;
            input.value = null;
            connection.invoke("PlayAgain", sessionId, name).catch(function (err) {
                return console.error(err.toString());
            });
        }
        return;
    }

    if (name == "") {

        if (input.value == "" || input.value == null) {
            input.value = null;
            displayMessage("Er is geen naam ingevuld.");
            return;
        } else if (input.value == opponent) {
            input.value = null;
            displayLargeMessage("Je naam mag niet het zelfde", "zijn als je tegenstander.");
            return;
        }

        name = input.value;
        document.getElementById("name1").innerText = name;
        document.getElementById("name1Mobile").innerText = name;


        displayMessage(input.value, "Left");
        input.value = null;
        document.getElementById("chatSend").disabled = true;
        document.getElementById("chatInput").disabled = true;

        setTimeout(() => { displayMessage("Welkom " + name + "."); }, 1000); 

        if (joinedGame) {
            setTimeout(() => { displayMessage("Het spel kan beginnen!"); }, 2000);
        } else {
            setTimeout(() => { displayLargeMessage("Stuur deze link naar een vriend", "om het spel te beginnen:"); }, 2000);
            setTimeout(() => { displayMessage("wordgame.luukwuijster.io?g=" + sessionId); }, 3000);
        }

        join();

        return;
    } 

    connection.invoke("SendMessage", sessionId, name, input.value, prevMessage).catch(function (err) {
        return console.error(err.toString());
    });
}

function runBar(playerName) {
    barWidth = barWidth - 0.02;

    document.getElementById("wordBarOverlay").style.width = barWidth + "rem";

    if (barWidth <= 0) {
        clearInterval(runBarInterval);

        console.log(playerName);

        if (playerName == name) {
            connection.invoke("OutOfTime", sessionId, opponent, prevMessage).catch(function (err) {
                return console.error(err.toString());
            });
        }
    }
}

function join() {
    connection.invoke("PlayerJoin", sessionId, name).catch(function (err) {
       return console.error(err.toString());
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

document.getElementById("chatSend").addEventListener("click", sendChat);
document.getElementById("chatInput").addEventListener("keyup", (event) => {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendChat();
    }
});