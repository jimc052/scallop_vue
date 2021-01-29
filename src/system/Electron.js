import child_process from "child_process";
console.log(child_process)

export default class Electron {
  static fs = require("fs");

  static shell(args, output){
    let arr = args.split(" ");
    let cmd = arr[0];
    arr.splice(0, 1);

    return new Promise( (success, error) => {
      // let spawn = require("child_process").spawn;
  
      let stdout = "";
      let bat = child_process.spawn(cmd, arr);
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
  }
  static checkDevice(){
    console.log("checkDevice")
    return new Promise( async (success, error) => {
      try {
        let result = await Electron.shell("adb devices -l");
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
  }
}