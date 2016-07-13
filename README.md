# clocksy [![npm version](https://img.shields.io/npm/v/clocksy.svg)](https://www.npmjs.com/package/clocksy)

Transport-agnostic client-server clock synchronization.


## Why?

* Simplicity
* Automatic requests, typically converging to few ms
* Transport-agnostic: use it with HTTP, WebSockets, MQTT, whatever.


## Installation

```
$ npm install --save clocksy
```


## Usage

### Server

Example usage with socket.io: just call `ClocksyServer.processRequest()`
and return the result to the client as fast as you can:

```js
import { ClocksyServer } from 'clocksy'; // const { ClocksyServer } = require('clocksy');

const clocksy = new ClocksyServer();
// ...
socket.on('MSG', msg => {
  const { type, data } = msg;
  if (type === 'CLOCKSY') {
    socket.emit('MSG', {
      type: 'CLOCKSY',
      data: clocksy.processRequest(msg.data),
    });
    return;
  }
  // ...
})
```

### Client

Enable/disable automatic requests by using `ClocksyServer.start|stop()`
and pass any response you get from the server to Clocksy, as fast as you can:

```js
import { ClocksyClient } from 'clocksy'; // const { ClocksyClient } = require('clocksy');

const socket = socketio.connect(url);
const clocksy = new ClocksyClient({
  sendRequest: req => socket.emit('MSG', { type: 'CLOCKSY', data: req }),
  // Other parameters and their default values:
  // alpha: 0.2,  // higher levels accelerate convergence but decrease accuracy
  // updatePeriod: 10000,  // [ms] how often should Clocksy estimate clock error
});
socket.on('connect', () => clocksy.start());
socket.on('disconnect', () => clocksy.stop());
socket.on('MSG', msg => {
  const { type, data } = msg;
  if (type === 'CLOCKSY') {
    const tDelta = clocksy.processResponse(msg.data);
    // Use this tDelta for whatever purpose you want
    // (you can also get it later on with clocksy.getDelta())
    return;
  }
});
```


## [Changelog](https://github.com/guigrpa/clocksy/blob/master/CHANGELOG.md)


## License (MIT)

Copyright (c) [Guillermo Grau Panea](https://github.com/guigrpa) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
