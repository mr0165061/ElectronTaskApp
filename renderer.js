const electron = require('electron')
const ipc = electron.ipcRenderer

var app = require('electron').remote;
var dialog = app.dialog;
var fs = require('fs');

var myTaskList = [];
var lastPosition = -1;

document.getElementById("addItem").addEventListener('click', addItemToList);
document.getElementById("itemText").onkeypress = function (e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    //Enter key is pressed
    if (keyCode == '13') {
        e.preventDefault();
    }
}

ipc.on('openAFile', (evt) => {
    openFile();
});

ipc.on('saveAFile', (evt) => {
    saveFile();
});

ipc.on('displaydata', (evt, textData) => {
    setTextData(textData);
});

ipc.on('clearAllItems', (evt) => {
    removeAllTaskElements();
    myTaskList = [];
});

ipc.on('inputGainFocus', (evt) => {
    inputBoxGainFocus();
});

function inputBoxGainFocus() {
    document.getElementById("itemText").focus();
}

function openFile() {
    dialog.showOpenDialog({ filters: [{ name: 'Text', extensions: ['txt'] }] }, (filesnames) => {
        if (filesnames === undefined) {
            alert("no files were selected");
            return;
        }
        readFile(filesnames[0]);
    });
}

function readFile(filepath) {
    fs.readFile(filepath, 'utf-8', (err, data) => {
        if (err) {
            alert("There was an error oping your file");
            return;
        }
        data = data.split("^,").join("^");
        var myData = data.split("^");
        myTaskList = [];
        setTextData(myData);
    });
}

function saveFile() {
    dialog.showSaveDialog({ filters: [{ name: 'Text', extensions: ['txt'] }] }, (filename) => {
        if (filename === undefined) {
            alert("You didn't enter a file name");
            return;
        }

        var myList = document.getElementById('taskList');
        var buttons = document.querySelectorAll('button');
        var content = [];
        for (var i = 0; i < buttons.length; i++) {
            var buttonText = buttons[i].firstChild.nodeValue;
            if (buttonText != "dead button") {
                content[i] = buttonText + "^";
            }
        }
        fs.writeFile(filename, content, (err) => {
            if (err) console.log(err);
            alert("The file has been saved successfully");
        });
    });
}

function addItemToList() {
    var itemName = document.getElementById("itemText").value;
    lastPosition = lastPosition + 1;
    myTaskList[lastPosition] = itemName;
    ipc.send('displayText', myTaskList);
    inputBoxGainFocus();
    document.getElementById("itemText").value = "";
    myTaskList = [];
}

function deleteItemFromList(btn) {
    var myBtn = document.getElementById("taskBtn" + btn);
    myTaskList.splice(myTaskList.indexOf(myBtn.innerHTML), 1);
    removeTaskElement(btn);
}

function setTextData(textData) {
    removeAllTaskElements();
    var lastOpenPosition = myTaskList.length;
    for (var i = 0; i < textData.length; i++) {
        if (textData[i] === "") { continue; }
        myTaskList[lastOpenPosition] = textData[i];
        lastOpenPosition++;
    }
    printOutArray();
}

function printOutArray() {
    var taskList = document.getElementById("taskList");
    for (var i in myTaskList) {
        var btn = document.createElement("button");
        btn.innerHTML = myTaskList[i];
        btn.id = "taskBtn" + i;
        btn.className = "taskButton";
        btn.onclick = (function () {
            var currentI = i;
            return function () {
                deleteItemFromList(currentI);
            }
        })();
        taskList.appendChild(btn);
    }
}

function removeAllTaskElements() {
    var myList = document.getElementById('taskList');
    var buttons = document.querySelectorAll('button');
    for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].innerHTML == "dead button") { continue; }
        removeTaskElement(i);
    }
}

function removeTaskElement(btn) {
    var taskList = document.getElementById("taskList");
    var element = document.getElementById('taskBtn' + btn);
    taskList.removeChild(element);
}