/*!
 * Clocksy
 *
 * Transport-agnostic client-server clock synchronization.
 *
 * @copyright Guillermo Grau Panea 2016
 * @license MIT
 */
import { set as timmSet } from 'timm';

const DEFAULT_PERIOD = 10000;
const DEFAULT_ALPHA = 0.2;

//-------------------------------------
// ClocksyServer
//-------------------------------------
/* --
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
-- */
class ClocksyServer {
  processRequest(req) {
    return timmSet(req, 'tServer', new Date().getTime());
  }
}

//-------------------------------------
// ClocksyClient
//-------------------------------------
/* --
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
    // tDelta is the estimated server time minus the local time.
    // Use this dekta for whatever purpose you want
    // (you can also get it later on with clocksy.getDelta())
    return;
  }
});
```
-- */
class ClocksyClient {
  constructor({
    alpha = DEFAULT_ALPHA,
    updatePeriod = DEFAULT_PERIOD,
    sendRequest,
  } = {}) {
    this.tDelta = null;
    this.timer = null;
    this.alpha = alpha;
    this.updatePeriod = updatePeriod;
    this.sendRequest = sendRequest || (() => {});
  }

  createRequest() {
    return { tTx: new Date().getTime() };
  }

  processResponse(rsp) {
    const tRx = new Date().getTime();
    const { tTx, tServer } = rsp;
    const rtt = tRx - tTx;
    const tDelta = tServer - (rtt / 2) - tTx;
    this.tDelta = this.calcNewDelta(tDelta);
    return this.tDelta;
  }

  calcNewDelta(tDelta) {
    const { tDelta: tDelta0, alpha } = this;
    return tDelta0 != null ?
      alpha * tDelta + (1 - alpha) * tDelta0 :
      tDelta;
  }

  getDelta() {
    return this.tDelta;
  }

  start() {
    if (this.timer != null) this.stop();
    this.sendAutoRequest();
    this.timer = setInterval(this.sendAutoRequest.bind(this),
      this.updatePeriod);
  }

  stop() {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  sendAutoRequest() {
    const req = this.createRequest();
    this.sendRequest(req);
  }
}

//-------------------------------------
// API
//-------------------------------------
export {
  ClocksyClient,
  ClocksyServer,
};
