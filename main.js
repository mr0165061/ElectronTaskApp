const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const Menu = electron.Menu

const ipc = electron.ipcMain

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 1000
    });

    mainWindow.loadURL(path.join(__dirname, "index.html"));

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    createSecondaryWindow();

    mainWindow.on('closed', function () {
        console.log('electron app closed');
        mainWindow = null;
    });
});

function createSecondaryWindow() {
    secondaryWindow = new BrowserWindow({
        parent: mainWindow,
        width: 300,
        height: 200
    });
    secondaryWindow.loadURL(path.join(__dirname, "itemAdd.html"));
    secondaryWindow.hide();
}

const template = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Open file',
                click: _ => {
                    mainWindow.webContents.send('openAFile');
                },
                accelerator: 'Ctrl+O'
            },
            {
                label: 'Save file',
                click: _ => {
                    mainWindow.webContents.send('saveAFile');
                },
                accelerator: 'Ctrl+S'
            }, { type: 'separator' },
            {
                label: 'Quit',
                click: _ => {
                    app.quit();
                },
                accelerator: 'Ctrl+Q'
            }
        ]
    },
    {
        label: 'Items',
        submenu: [
            {
                label: 'Add an item',
                click: _=> {
                    secondaryWindow.show();
                }
            },
            {
                label: 'Clear all items',
                click: _=> {
                    mainWindow.webContents.send('clearAllItems');
                    //This is added because the function above kills the child window
                    createSecondaryWindow();
                }
            }
        ]
    },
    {
        label: "Dev Tools",
        click: function (item, focusedWindow) {
            focusedWindow.toggleDevTools();
        },
        accelerator: 'Ctrl+D'
    }
]

ipc.on('displayText', (evt, textData) => {    
    mainWindow.webContents.send('displaydata', textData);
});