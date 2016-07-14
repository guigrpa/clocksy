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
      data: clocksy.processRequest(data),
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
    const tDelta = clocksy.processResponse(data);
    // tDelta is the estimated server time minus the local time.
    // Use this delta for whatever purpose you want, e.g.
    // correcting the local time for graphs or changing the timestamps
    // of data downloaded from the server...
    // If you don't need the delta immediately, you can also obtain it later
    // calling clocksy.getDelta())
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
    this.rtt = null;
    this.timer = null;
    this.alpha = alpha;
    this.updatePeriod = updatePeriod;
    this.sendRequest = sendRequest || (() => {});

    // Keep track of the tab's shown/hidden status. Chrome
    // goes bonkers with the timers in hidden windows, so RTT
    // calculations are not reliable. Automatic requests are
    // not sent while the tab is hidden.
    this.fHiddenTab = false;
    try {
      this.fHiddenTab = document.hidden;
      document.addEventListener('visibilitychange', () => {
        this.fHiddenTab = document.hidden; // change tab text for demo
      });
    } catch (err) { /* ignore */ }
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
    this.rtt = rtt;
    return this.tDelta;
  }

  calcNewDelta(tDelta) {
    const { tDelta: tDelta0, alpha } = this;
    return tDelta0 != null ?
      alpha * tDelta + (1 - alpha) * tDelta0 :
      tDelta;
  }

  getDelta() { return this.tDelta; }
  getRtt() { return this.rtt; }

  start() {
    if (this.timer != null) this.stop();
    this.sendAutoRequest(true);
    this.timer = setInterval(this.sendAutoRequest.bind(this),
      this.updatePeriod);
  }

  stop() {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  sendAutoRequest(fForce) {
    if (this.fHiddenTab && !fForce) return;
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
