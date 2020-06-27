
const urlParams = new URLSearchParams(window.location.search);
let sessionId;
let _username = "user-" + makeid(12);
let darkmode = "false";

if (localStorage.getItem("darkmode") == null) {
    localStorage.setItem("darkmode", "false");
} else {
    darkmode = localStorage.getItem("darkmode");
}

if (darkmode == "true") {

    $(".darkmode-switch").removeClass("darkmode-switch-light");
    $(".darkmode-switch").addClass("darkmode-switch-dark");

    $("body").css("background-color", "#212121");

    $(".new-item").addClass("new-item-dark");
    $(".new-item-button").addClass("new-item-button-dark");
    $(".version").addClass("version-dark");

    $(".background-switch").addClass("background-switch-dark");
    $(".background-selector-container").addClass("background-selector-container-dark");
    $(".background-selector-header-title").addClass("background-selector-header-title-dark");
    $(".background-selector-header-close").addClass("background-selector-header-close-dark");
    $(".background-selector-image-no-background").addClass("background-selector-image-no-background-dark");
}

let bi = localStorage.getItem("background-image");

$("html, body").css("background-image", bi);

if (localStorage.getItem("username") == null) {

    let usernameInput = prompt("Vul je username in:");

    if (usernameInput != "") {
        localStorage.setItem("username", usernameInput + " (" + makeid(12) + ")");
        _username = localStorage.getItem("username");
    }
} else {
    _username = localStorage.getItem("username");
}

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

            let darkmodeClass = "";

            if (darkmode == "true") {
                darkmodeClass = "item-dark";
            }

            if (item.path == null) {

                let noteHtml = `        
                        <div class= "item ${darkmodeClass}" id="${item.ID}">
                        <div class= "item-header">
                            <div class="item-header-left">
                                <div class="item-number-note">#</div>
                                <b class="userName"> ${item.userName.split("(")[0]}</b>
                            </div>
                            <div class="item-buttons">`;

                if (_username == item.userName) {
                    noteHtml += `<button class="item-button item-mutate-button item-edit-button"></button>
                                <button class="item-button item-mutate-button item-remove-button"></button>`;
                }

                noteHtml += `</div>
                        </div >
                        <div class="item-body">${item.noteText}</div>
                        <div class="item-footer">
                            <code class="timeStamp">${item.dateTime}</code>
                        </div>
                        </div >`;

                $(".new-item").after(noteHtml)

            } else {

                let imageHtml = `<div class= "item ${darkmodeClass}" id="${item.ID}">
                                    <div class= "item-header">
                                        <div class="item-header-left">
                                            <div class="item-number">${item.number}</div>
                                            <b class="userName"> ${item.userName.split("(")[0]}</b>
                                        </div>
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
                                    <code class="timeStamp">${item.dateTime}</code>
                                </div>
                                </div >`;


                $(".new-item").after(imageHtml);
            }
            
        });
    },
});

connection.on("ReceiveNote", function (noteId, username, noteBody, dateTime) {

    if (_username == username) {
        return;
    }

    let darkmodeClass = "";

    if (darkmode == "true") {
        darkmodeClass = "item-dark";
    }

    if ($("#"+noteId).length == 0) {
        $(".new-item").after(`        
        <div class= "item ${darkmodeClass}" id="${noteId}">
        <div class= "item-header">
            <div class="item-header-left">
                <div class="item-number-note">#</div>
                <b class="userName"> ${username.split("(")[0]}</b>
            </div>
            <div class="item-buttons">
            </div>
        </div >
        <div class="item-body">${noteBody}</div>
        <div class="item-footer">
            <code class="timeStamp">${dateTime}</code>
        </div>
        </div >`);

        $(".item").first().hide().show('fast');
    } else {
        $("#"+noteId).children(".item-body").empty().append(noteBody);
    }

});

connection.on("ReceiveImage", function (username, path, dateTime, imageId, number) {

    let darkmodeClass = "";

    if (darkmode == "true") {
        darkmodeClass = "item-dark";
    }

    let imageHtml = `<div class= "item ${darkmodeClass}" id="${imageId}">
        <div class= "item-header">
            <div class="item-header-left">
                <div class="item-number">${number}</div>
                <b class="userName"> ${username.split("(")[0]}</b>
            </div>
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
            <code class="timeStamp">${dateTime}</code>
        </div>
        </div >`;

        $(".new-item").after(imageHtml);
        $(".item").first().hide().show('fast');
});

connection.on("Remove", function (itemId, username) {

    if (_username == username) {
        return;
    }

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
    let darkmodeClass = "";

    if (darkmode == "true") {
        darkmodeClass = "item-dark";
    }

    $(".new-item").after(`        
        <div class= "item ${darkmodeClass}" style="border: 2px solid #EF9A9A">
        <div class= "item-header">
            <div class="item-header-left">
                <div class="item-number-note">#</div>
                <b class="userName"> ${_username.split("(")[0]}</b>
            </div>
            <div class="item-buttons">
                <button class="item-button item-mutate-button item-save-button"></button>
                <button class="item-button item-mutate-button item-remove-button"></button>
            </div>
        </div >
        <div class="item-body">
            <textarea class="item-input" rows="4" cols="41"></textarea>
        </div>
        <div class="item-footer">
            <code class="timeStamp">${str_pad(date.getDate())}-${str_pad(date.getMonth() + 1)}-${date.getFullYear()} ${str_pad(date.getHours())}:${str_pad(date.getMinutes())}:${str_pad(date.getSeconds())}</code>
        </div>
        </div >`);

    $(".item").first().hide().show('fast');
});

$("body").bind("paste", function (e) {
    var hasFile = false;
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (index in items) {
        var item = items[index];
        if (item.kind === 'file') {
            hasFile = true;
            var blob = item.getAsFile();
            var reader = new FileReader();
            reader.onload = function (event) {

                $(".new-item").after(`<div class="spinning-arrow"></div>`);

                if (darkmode == "true") {
                    $(".spinning-arrow").addClass("spinning-arrow-dark");

                }

                let dataObject = {
                    "imageId": genGuid(),
                    "sessionId": sessionId,
                    "username": _username,
                    "blob": event.target.result.split("base64,")[1]
                };

                $.ajax({
                    type: "POST",
                    url: "/api/board",
                    data: JSON.stringify(dataObject),
                    contentType: 'application/json; charset=utf-8',
                    dataType: "text",
                    success: function () {

                        $(".spinning-arrow").hide('fast', function () {
                            $(this).remove();
                        });

                    },
                    error: function () {
                        $(".new-item-button").css("filter", "opacity(50%)");
                        $(".new-item-button").css("background-color", "#E53935");

                        setTimeout(function () {
                            $(".new-item-button").css("filter", "opacity(12%)");
                            $(".new-item-button").css("background-color", "#FFFFFF");
                        }, 1000);
                    }
                });
            }; // data url!
            reader.readAsDataURL(blob);
        } 
    }

    if (!hasFile) {

        console.log("Hey");

        if (darkmode != "true") {
            $(".new-item-button").css("filter", "opacity(50%)");
        }

        $(".new-item-button").css("background-color", "#FB8C00");

        setTimeout(function () {

            if (darkmode == "true") {
                $(".new-item-button").css("filter", "opacity(90%)");
                $(".new-item-button").css("background-color", "#424242");
            } else {
                $(".new-item-button").css("filter", "opacity(12%)");
                $(".new-item-button").css("background-color", "#FFFFFF");
            }
        }, 1000);
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

//#####################################
//###          Clear All            ###
//#####################################

let clearButtonPressed = false;


$(".clear-button-summon").click(function () {

    $(".clear-button-yes").fadeIn(200);
    $(".clear-button-no").fadeIn(200);

    $(".clear-button-summon").html("Are you sure?");
    $(".clear-button-summon").removeClass("clear-button-summon").addClass("clear-button-sure").prop("disabled", true);;

});

$(".clear-button-yes").click(function () {

    resetClearButtons();

    $(".item").fadeOut(200, function () {
        $(this).remove();
    });

    connection.invoke("ClearAll", sessionId, _username).catch(function (err) {
        return console.error(err.toString());
    });

});

$(".clear-button-no").click(resetClearButtons);

function resetClearButtons() {

    $(".clear-button-yes").fadeOut(200);
    $(".clear-button-no").fadeOut(200);

    $(".clear-button-sure").html("Clear Board");
    $(".clear-button-sure").removeClass("clear-button-sure").addClass("clear-button-summon").prop("disabled", false);
}

//#####################################
//###          Background           ###
//#####################################

$(".background-switch").click(function () {

    $(".background-selector-overlay").css("display", "flex").hide().fadeIn(200);

});

$(".background-selector-header-close").click(function () {

    $(".background-selector-overlay").fadeOut(200);

});

$(".background-selector-image").click(function () {

    if ($(this).hasClass("background-selector-image-no-background")) {
        $("body").css("background-image", "");
        localStorage.setItem("background-image", "");

    } else {

        let bi = $(this).css("background-image");
        $("body").css("background-image", bi);
        localStorage.setItem("background-image", bi);

    }

});

//#####################################
//###            Darkmode           ###
//#####################################

$(".darkmode-switch").click(function () {

    if ($(this).hasClass("darkmode-switch-light")) {
        //dark theme
        darkmode = "true";
        localStorage.setItem("darkmode", "true");

        $(this).removeClass("darkmode-switch-light");
        $(this).addClass("darkmode-switch-dark");

        $("body").css("background-color", "#212121");

        $(".new-item").addClass("new-item-dark");
        $(".item").addClass("item-dark");
        $(".new-item-button").addClass("new-item-button-dark");
        $(".version").addClass("version-dark");

        $(".background-switch").addClass("background-switch-dark");
        $(".background-selector-container").addClass("background-selector-container-dark");
        $(".background-selector-header-title").addClass("background-selector-header-title-dark");
        $(".background-selector-header-close").addClass("background-selector-header-close-dark");
        $(".background-selector-image-no-background").addClass("background-selector-image-no-background-dark");


    } else {
        //light theme
        darkmode = "false";
        localStorage.setItem("darkmode", "false");

        $(this).removeClass("darkmode-switch-dark");
        $(this).addClass("darkmode-switch-light");

        $("body").css("background-color", "#FAFAFA"); 

        $(".new-item").removeClass("new-item-dark");
        $(".item").removeClass("item-dark");
        $(".new-item-button").removeClass("new-item-button-dark");
        $(".version").removeClass("version-dark");

        $(".background-switch").removeClass("background-switch-dark");
        $(".background-selector-container").removeClass("background-selector-container-dark");
        $(".background-selector-header-title").removeClass("background-selector-header-title-dark");
        $(".background-selector-header-close").removeClass("background-selector-header-close-dark");
        $(".background-selector-image-no-background").removeClass("background-selector-image-no-background-dark");


    }
});

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