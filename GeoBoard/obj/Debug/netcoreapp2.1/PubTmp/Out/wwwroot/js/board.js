
const urlParams = new URLSearchParams(window.location.search);
let sessionId;
let _username = "user-" + makeid(12);

if (localStorage.getItem("username") == null) {

    let usernameInput = prompt("Vul je username in:");

    if (usernameInput != "") {
        localStorage.setItem("username", usernameInput + " (" + makeid(12) + ")");
        _username = localStorage.getItem("username");
    }
} else {
    _username = localStorage.getItem("username");
}

console.log("user: " + _username);

if (urlParams.get('board') != null && urlParams.get('board').length >= 6) {
    sessionId = urlParams.get('board');
} else {
    sessionId = makeid(8);
    window.location.replace("/?board=" + sessionId);
}

let connection = new signalR.HubConnectionBuilder().withUrl("/boardHub?sessionId=" + sessionId).build();

$.ajax({
    type: "POST",
    url: "/api/board/load/?sessionId=" + sessionId,
    success: function (data) {

        let newArray = [];

        let json = JSON.parse(data);

        json.Images.forEach((image) => {
            newArray.push(image);
        });

        json.Notes.forEach((note) => {
            newArray.push(note);
        });

        newArray.sort((a, b) => (a.dateTime > b.dateTime) ? 1 : ((b.dateTime > a.dateTime) ? -1 : 0)); 

        newArray.forEach((item) => {
            if (item.path == null) {

                let noteHtml = `        
                        <div class= "item" id="${item.ID}">
                        <div class= "item-header">
                            <b class="userName">${item.userName.split("(")[0]}</b>
                            <div class="item-buttons">`;

                if (_username == item.userName) {
                    noteHtml += `<button class="item-button item-mutate-button item-edit-button"></button>
                                <button class="item-button item-mutate-button item-remove-button"></button>`;
                }

                noteHtml += `</div>
                        </div >
                        <div class="item-body">${item.noteText}</div>
                        <div class="item-footer">
                            <p class="timeStamp">${item.dateTime}</p>
                        </div>
                        </div >`;

                $(".new-item").before(noteHtml)

            } else {

                let imageHtml = `<div class= "item" id="${item.ID}">
                                    <div class= "item-header">
                                    <b class="userName">${item.userName.split("(")[0]}</b>
                                    <div class="item-buttons">`;

                if (_username == item.userName) {
                    imageHtml += `<button class="item-button item-mutate-button item-remove-button"></button>`;
                }

                imageHtml += `</div>
                                </div >
                                <div class="item-body">
                                    <div class="item-image-container">
                                        <img class="item-image" src="${item.path}" />
                                    </div>
                                </div>
                                <div class="item-footer">
                                    <p class="timeStamp">${item.dateTime}</p>
                                </div>
                                </div >`;


                $(".new-item").before(imageHtml);
            }
            
        });
    },
});

connection.on("ReceiveNote", function (noteId, username, noteBody, dateTime) {

    if (_username == username) {
        return;
    }

    console.log(noteId);

    if ($("#"+noteId).length == 0) {
        $(".new-item").before(`        
        <div class= "item" id="${noteId}">
        <div class= "item-header">
            <b class="userName">${username.split("(")[0]}</b>
            <div class="item-buttons">
            </div>
        </div >
        <div class="item-body">${noteBody}</div>
        <div class="item-footer">
            <p class="timeStamp">${dateTime}</p>
        </div>
        </div >`);

        $(".item").last().hide().show('fast');
    } else {
        $("#"+noteId).children(".item-body").empty().append(noteBody);
    }

});

connection.on("ReceiveImage", function (username, path, dateTime, imageId) {

    let imageHtml = `<div class= "item" id="${imageId}">
        <div class= "item-header">
            <b class="userName">${username.split("(")[0]}</b>
            <div class="item-buttons">`;

    if (username == _username) {

        imageHtml += `<button class="item-button item-mutate-button item-remove-button"></button>`;

    } 

    imageHtml += `</div>
        </div >
        <div class="item-body">
            <div class="item-image-container">
                <img class="item-image" src="${path}" />
            </div>
        </div>
        <div class="item-footer">
            <p class="timeStamp">${dateTime}</p>
        </div>
        </div >`;


    $(".new-item").before(imageHtml);
    $(".item").last().hide().show('fast');



});

connection.on("Remove", function (itemId, username) {

    if (_username == username) {
        return;
    }

    console.log(itemId);

    if ($("#" + itemId).length > 0) {

        $("#" + itemId).hide('fast', function () {
            $(this).remove();
        });
    }
});

connection.on("ClearAll", function (username) {

    if (_username == username) {
        return;
    }

    $(".item").fadeOut(200, function () {
        $(this).remove();
    });

});

connection.start().then(function () {

}).catch(function (err) {
    return console.error(err.toString());
});

$(".new-item-button").click(function () {

    let date = new Date();

    $(".new-item").before(`        
        <div class= "item" style="border: 2px solid #EF9A9A">
        <div class= "item-header">
            <b class="userName">${_username.split("(")[0]}</b>
            <div class="item-buttons">
                <button class="item-button item-mutate-button item-save-button"></button>
                <button class="item-button item-mutate-button item-remove-button"></button>
            </div>
        </div >
        <div class="item-body">
            <textarea class="item-input" rows="4" cols="41"></textarea>
        </div>
        <div class="item-footer">
            <p class="timeStamp">${str_pad(date.getDate())}-${str_pad(date.getMonth() + 1)}-${date.getFullYear()} ${str_pad(date.getHours())}:${str_pad(date.getMinutes())}:${str_pad(date.getSeconds())}</p>
        </div>
        </div >`);

    $(".item").last().hide().show('fast');
});

$("body").bind("paste", function (e) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    console.log(JSON.stringify(items)); // will give you the mime types
    for (index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            var blob = item.getAsFile();
            console.log(blob);
            var reader = new FileReader();
            reader.onload = function (event) {

                let dataObject = {
                    "imageId": genGuid(),
                    "sessionId": sessionId,
                    "username": _username,
                    "blob": event.target.result.split("base64,")[1]
                };

                console.log(dataObject);

                $.ajax({
                    type: "POST",
                    url: "/api/board",
                    data: JSON.stringify(dataObject),
                    contentType: 'application/json; charset=utf-8',
                    dataType: "json"
                });

                console.log(event.target.result)
            }; // data url!
            reader.readAsDataURL(blob);
        }
    }

});

$(document).on('click', '.item-save-button', function () {

    $(this).removeClass("item-save-button").addClass("item-edit-button");

    let input = $(this).parents(".item").children(".item-body").children(".item-input").val();

    if (input == "") {
        $(this).parents(".item").hide('fast', function () {
            $(this).remove();
        });
        return;
    } 

    $(this).parents(".item").css("border", "none");

    $(this).parents(".item").children(".item-body").children(".item-input").remove();
    $(this).parents(".item").children(".item-body").append(input);

    let dateTime = $(this).parents(".item").children(".item-footer").children(".timeStamp").html();

    let guid = genGuid();

    if ($(this).parents(".item").attr("id") == null) {
        $(this).parents(".item").attr("id", guid);
    } else {
        guid = $(this).parents(".item").attr("id");
    }

    connection.invoke("SendNote", sessionId, guid, _username, input, dateTime).catch(function (err) {
        return console.error(err.toString());
    });
});


$(document).on('click', '.item-edit-button', function () {

    $(this).removeClass("item-edit-button").addClass("item-save-button");

    let text = $(this).parents(".item").children(".item-body").text().trim();

    $(this).parents(".item").children(".item-body").html("");
    $(this).parents(".item").children(".item-body").append(`<textarea class="item-input" rows="4" cols="41">${text}</textarea>`);

    $(this).parents(".item").css("border", "2px solid #EF9A9A");
});

$(document).on('click', '.item-remove-button', function () {

    let id = $(this).parents(".item").attr("id");

    connection.invoke("Remove", sessionId, id, _username).catch(function (err) {
        return console.error(err.toString());
    });

    $(this).parents(".item").hide('fast', function () {
        $(this).remove();
    });
});

let clearButtonPressed = false;

$(".clear-button-slider").mousedown(function (e) {

    $(".clear-button-slider").css("transition", "none");

    e = e || window.event;
    e.preventDefault();
    let pos1 = e.clientX;

    $(this).mousemove(function (e) {

        e = e || window.event;
        e.preventDefault();
        pos2 = e.clientX - pos1;

        if (pos2 > 0) {
            $(this).css("margin-left", pos2);
        }

        if (pos2 >= 208) {

            $(".clear-button-slider").unbind('mousemove').unbind('mouseup').unbind('mouseout');

            $(".item").fadeOut(200, function () {
                $(this).remove();
            });

            connection.invoke("ClearAll", sessionId, _username).catch(function (err) {
                return console.error(err.toString());
            });

            setTimeout(function () {
                $(".clear-button-slider").mouseup(resetClearButton).mouseout(resetClearButton);
                resetClearButton();
            }, 200);

            console.log("hey");
        }
    });

}).mouseup(resetClearButton).mouseout(resetClearButton);

function resetClearButton() {
    $(".clear-button-slider").unbind('mousemove');

    $(".clear-button-slider").css("transition", "margin 700ms");
    $(".clear-button-slider").css("margin-left", "0");
}

//#####################################
//###             Images            ###
//#####################################

let overlayImage = document.querySelector("#overlay-image");

overlayImage.addEventListener("click", () => {
    if (overlayImage.classList.contains("overlay-image-zoom-in")) {
        overlayImage.setAttribute("class", "overlay-image-zoom-out");
    } else {
        overlayImage.setAttribute("class", "overlay-image-zoom-in");
    }
});

document.querySelector(".overlay-button").addEventListener("click", closeImage);
document.querySelector(".overlay").addEventListener("click", closeImage);

$(document).on('click', '.item-image', openImage);

function openImage() {


    $("#overlay-image").attr("src", $(this).attr("src"))


    $(".overlay").css("display", "flex").hide().fadeIn(200);
    $("#overlay-image").css("display", "flex").hide().fadeIn(200);
    $(".overlay-button").css("display", "flex").hide().fadeIn(200);

}

function closeImage() {
    if (event.target.nodeName == 'IMG') {
        return;
    }

    $(".overlay").fadeOut(200);
    $("#overlay-image").fadeOut(200);
    $(".overlay-button").fadeOut(200);
}

//#####################################
//###          Functions            ###
//#####################################

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

function genGuid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
function str_pad(n) {
    return String("00" + n).slice(-2);
}