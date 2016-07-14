# clocksy [![npm version](https://img.shields.io/npm/v/clocksy.svg)](https://www.npmjs.com/package/clocksy)

Transport-agnostic client-server clock synchronization.


## Why?

* **Simple algorithm**: timestamp at the client, timestamp at the server and send back, measure round-trip time, estimate server time and apply an [IIR filter](https://en.wikipedia.org/wiki/Infinite_impulse_response) to improve accuracy over time.
* **Transport-agnostic**: use it on top of your own transport layer: HTTP, WebSockets, MQTT, whatever.
* **Simple implementation**: since it leaves transport on the user's hands, it is exactly 5 LOCs for the server, ~70 for the client.
* **Automatic requests**, typically converging to < 10 ms in a few iterations.
* **Automatic background tab detection**: Chrome goes bonkers with –sorry, optimizes– timers on background tabs, interfering with clocksy's algorithm. Automatic clock updates are switched off while a tab is hidden.


## Installation

```
$ npm install --save clocksy
```


## Usage

[[[./src/index.js]]]


## Related

* [timesync](https://github.com/enmasseio/timesync): provides more functionalities, but is apparently more complex.


## [Changelog](https://github.com/guigrpa/clocksy/blob/master/CHANGELOG.md)


## License (MIT)

Copyright (c) [Guillermo Grau Panea](https://github.com/guigrpa) 2016

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
