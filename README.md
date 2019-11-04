# Serial Monitor/MQTT Proxy

This tool serves as a debugging proxy for devices connected to serial port. 

1. Install this package using `npm install .`
2. Add your MQTT server credentials to `config.js` (optional, template is in `config.dist.js`)
3. Run the `sermon` using node.js via examples below.

## Usage

However this step is optional and serial-monitor works without MQTT, this is not its main purpose. So first, you should (optionally) configure the `config.js` file with your MQTT server, username and password. Otherwise error messages should be expected so far.

### Arguments (in order of appearance)

`device-alias` parameter is name of the logged device, used as MQTT channel
`device-path` parameter is path to the serial device like `/dev/cu.usbserial01`

node sermon.js [device-alias] [device-path]

### Examples:

```
node sermon.js // device auto-detect and random alias

node sermon.js device-alias // device auto-detect with alias "device-alias"

node sermon.js device-alias /dev/cu.usbserial-1410 // specific device with alias "device-alias"
```
