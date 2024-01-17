if (navigator.userAgent.indexOf("Electron") > -1) {
  const {remote: app, ipcRenderer: ipc, clipboard: clipboard} = require('electron');
  let sharedObj = app.getGlobal("sharedObj");
  let fs = require("fs");
  if (!fs.existsSync(sharedObj.path)) {
    fs.mkdirSync(sharedObj.path);
  }
  window.process = process;

  window.pathScript = sharedObj.path + sharedObj.separator + "monkey-script";
  if (!fs.existsSync(window.pathScript)) {
    fs.mkdirSync(window.pathScript);
  }

  window.readImage = () => {
    const contents = fs.readFileSync(sharedObj.path + sharedObj.separator + "monkey-script" 
      + sharedObj.separator + 'screen.png', {encoding: 'base64'});
    return "data:image/png;base64," + contents;
  }

  window.shell = (args, output) => {
    let arr = args.split(" ");
    let cmd = arr[0];
    arr.splice(0, 1);

    return new Promise( (success, error) => {
      let spawn = require("child_process").spawn;
  
      let stdout = "";
      let bat = spawn(cmd, arr);
      bat.stdout.on("data", (data) => {
        // console.log(data.toString())
        stdout += data.toString();
        if(typeof output == "function") {
          output(data.toString())
        }
      });

      bat.stderr.on("data", (err) => {
        // console.log(err.toString())
        if(stdout.length == 0)
          error(err.toString())
      });

      bat.on("exit", (code) => {
        success(stdout);
        // console.log(stdout)
      });  
    });
  };

  window.child_process = { spawn, exec } = require("child_process")
  // console.log(window.child_process)

  window.checkDevice = () => {
    return new Promise( async (success, error) => {
      try {
        let result = await window.shell("adb devices -l");
        let devices = result.split("\n");
        if(devices.length == 0) {
          throw "沒有連接 Android 裝置"
        } else {
          let device = "";
          for(let i = 1; i < devices.length; i++) {
            if(device.length == 0 && devices[i].length == 0){
              throw "沒有連接 Android 裝置"
            } else if(device.length == 0){
              device = devices[i];
            } else if(devices[i].length > 0) {
              throw "太多的連接 Android 裝置"
            }
          }
          
          let list = {"H14": "CITAQ_H14", "V2": "V2"};
          for(let key in list) {
            if(device.indexOf("model:" + list[key]) > -1) {
              device = key;
              break;
            }
          }
          success(device)
        }
      } catch(e) {
        error(e)
        alert(e)
      }
      // console.log(result2);
    })
    /*
      0123456789ABCDEF       device usb:337838080X product:Citaq_32 model:CITAQ_H14 device:Citaq_32 transport_id:7
      VB02198400090          device usb:337772544X product:V2 model:V2 device:V2 transport_id:3
      */
  };

  window.screenCapture = () => {
    return new Promise( async (success, error) => {
      try{
        console.log("screenCapture: " + (new Date()) + ", start......");
        let androidPath = "/sdcard";
        await window.shell("adb shell screencap -p " + androidPath + "/Download/screen.png");
        console.log("screenCapture: " + (new Date()) + ", finish......");

        let result2 = await window.shell("adb pull " + androidPath + "/Download/screen.png " + window.pathScript + "/screen.png");
        console.log("pull: "  + (new Date()) + "\n  " + result2);

        // let result3 = await window.shell("adb shell rm " + androidPath + "/Download/screen.png");
        // console.log("rm: " + result3);

        let img = window.readImage();
        success(img)
      } catch(e) {
        error(e)
      }
    });
  }

  window.execScript = (txt, arg) => {
    let {cycle, stdout, write} = arg;
    return new Promise( async (success, error) => {
      try{
        let androidPath = "/sdcard";
        if(typeof write == "undefined" || write == true) {
          window.fileWrite(window.pathScript + "/monkey.script", txt);

          if(typeof stdout == "function") stdout("adb shell rm -f monkey.script ......");
          let result1 = await window.shell("adb shell rm -f " + androidPath + "/monkey.script");
          if(typeof stdout == "function") 
            stdout(result1);
          else
            console.log("adb shell rm: " + result1);

          if(typeof stdout == "function") stdout("adb push monkey.script ......");
          let result2 = await window.shell("adb push " + window.pathScript + "/monkey.script " + androidPath + "/monkey.script");
          if(typeof stdout == "function") 
            stdout(result2);
          else
            console.log("adb push: " + result2);
        }

        if(typeof stdout == "function") stdout("adb shell monkey ......");
        cycle = typeof cycle == "number" ? cycle : 1;
        for(let i = 0; i < cycle; i++) {
          let result3 = await window.shell("adb shell monkey -f " + androidPath + "/monkey.script 1");
          if(typeof stdout == "function") 
            stdout((cycle > 1 ? "第 " + (i + 1) + " 次：\n" : "") + result3);
          else 
            console.log("adb shell monkey1: " + result3);
          // (typeof cycle == "number" ? cycle : 1), (data)=>{
          //   console.log("adb shell monkey2: " + data);
          // });
          // if(typeof stdout == "function") 
          //   stdout(result3);
          // else 
          //   console.log("adb shell monkey1: " + result3);
        }
        success();
      } catch(e) {
        alert(e)
        error(e)
      }
    });
  }

  window.fileWrite = (path, txt) => {
    try{
      fs.writeFileSync(path, txt, 'utf8');
    } catch(e) {

    }
  }
}

    // const {remote: app, ipcRenderer: ipc, clipboard: clipboard} = require('electron');
    
    // window.app = app; window.ipc = ipc; window.clipboard = clipboard;
    // window.fs = require("fs"), window.os = require('os');
    // // console.log(fs)

  // console.log(window.process.env.USER, window.process)