/* jshint node: true */

/* TODO: Add baudrate and port attribute/ENV */

var fs = require('fs-extra');
var mqtt = require("mqtt");

var SerialPort = require('serialport');
var Readline = require('@serialport/parser-readline');
var Finder = require("fs-finder");

var device = "/dev/cu.usbserial-1410"; // default

var device_alias = "";
if (typeof(process.argv[2]) !== "undefined") {
  device_alias = process.argv[2];
} else {
  console.log("[hint] Supply a device alias as second argument, otherwise devices will be always random.");
  device_alias = new Date().getTime();
}

// first argument
if (typeof(process.argv[3]) !== "undefined") {
  var device_path = process.argv[3];
  if (fs.existsSync(device_path)) {
    device = device_path;
  } else {
    console.log("Submitted device parameter invalid, falling back to default...");
  }
} else {
  console.log("[hint] Supply a device path as first argument, otherwise devices will be selected automatically.");
}


var paths = Finder.from("/dev").find();

paths.forEach(function(path) {
  if (path.indexOf("cu.usbserial-") !== -1) {
    device = path;
    console.log("Found Wemos D1 R2 Mini at", device);
  }
  if (path.indexOf("cu.SLAB_USBtoUART") !== -1) {
    device = path;
    console.log("Found Wemos D1 Mini Pro at", device);
  }
});

// default/existing device check
if (!fs.existsSync(device)) {
  console.log("No valid device found.");
  process.exit(1);
}

var port = new SerialPort(device, { baudRate: 230400 });
var parser = port.pipe(new Readline({ delimiter: '\r\n' }));

// Additional requirements (MQTT logger)
var app_config = require("./config.js");

var mosquitto = mqtt.connect(app_config.guru.server, {
  host: app_config.guru.mqtt,
  port: app_config.guru.port,
  username: app_config.guru.username,
  password: app_config.guru.password
});

var connected = false;

mosquitto.on("connect", (error) => {
  connected = true;
  console.log("mosquitto connected.");
});

mosquitto.on("reconnect", () => {
  console.log("[mosquitto] reconnected");
});

mosquitto.on("error", (error) => {
  console.log("mosquitto error " + error);
  connected = false;
});

mosquitto.on('close', () => {
  console.log('[mqtt] Connection closed.');
  connected = false;
});

// Read the port data
port.on("open", function () {
    console.log('Serial port', device, 'open:');
    parser.on('data', function(data) {
        console.log(data);
        if (connected) {
          mosquitto.publish("/" + app_config.guru.username + "/logs/" + device_alias, data);
        }
    });
});
