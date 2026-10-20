const {app,BrowserWindow}=require('electron');
const path=require('node:path');
app.setName('Alchemy Ruins');
app.whenReady().then(()=>{const win=new BrowserWindow({width:1360,height:920,minWidth:900,minHeight:640,backgroundColor:'#080c14',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',e=>e.preventDefault());win.loadFile(path.join(__dirname,'web','index.html'));});
app.on('window-all-closed',()=>app.quit());
