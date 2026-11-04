/* WalkerOps Studio · OBS link
   Small obs-websocket v5 client (built into OBS 28+). Used by the console
   to control OBS, and by the on-air pages (board, ticker) to receive updates. */
(function () {
  const CHANNEL = 'vcl-studio';

  // Plain-JS SHA-256 so authentication also works where crypto.subtle is
  // unavailable (OBS "Local file" browser sources load over a non-secure origin).
  function sha256Bytes(bytes) {
    const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const len = bytes.length, bitLen = len * 8;
    const padded = new Uint8Array(((len + 9 + 63) >> 6) << 6);
    padded.set(bytes); padded[len] = 0x80;
    const dv = new DataView(padded.buffer);
    dv.setUint32(padded.length - 4, bitLen >>> 0);
    dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));
    const W = new Uint32Array(64);
    const ror = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < padded.length; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) {
        const s0 = ror(W[i-15],7) ^ ror(W[i-15],18) ^ (W[i-15] >>> 3);
        const s1 = ror(W[i-2],17) ^ ror(W[i-2],19) ^ (W[i-2] >>> 10);
        W[i] = (W[i-16] + s0 + W[i-7] + s1) >>> 0;
      }
      let [a,b,c,d,e,f,g,h] = H;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (ror(e,6) ^ ror(e,11) ^ ror(e,25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) >>> 0;
        const t2 = ((ror(a,2) ^ ror(a,13) ^ ror(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0]=(H[0]+a)>>>0; H[1]=(H[1]+b)>>>0; H[2]=(H[2]+c)>>>0; H[3]=(H[3]+d)>>>0;
      H[4]=(H[4]+e)>>>0; H[5]=(H[5]+f)>>>0; H[6]=(H[6]+g)>>>0; H[7]=(H[7]+h)>>>0;
    }
    const out = new Uint8Array(32);
    H.forEach((v, i) => new DataView(out.buffer).setUint32(i * 4, v));
    return out;
  }
  function sha256b64(str) {
    let bin = '';
    sha256Bytes(new TextEncoder().encode(str)).forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin);
  }
  window.__vclSha256b64 = sha256b64; // for testing

  // Event groups: General (custom events) 1, Scenes 4, Outputs 64, Scene items 128
  const SUBS = { basic: 1, full: 1 | 4 | 64 | 128 };

  class ObsLink {
    constructor({ host = 'localhost', port = 4455, password = '', subscribe = 'basic', onMessage, onEvent, onStatus }) {
      Object.assign(this, { host, port, password, onMessage, onEvent, onStatus });
      this.subs = SUBS[subscribe] || 1;
      this.ready = false; this.reqId = 0; this.pending = new Map();
      this.retry = null; this.closedOnPurpose = false;
    }
    status(s, detail) { this.onStatus && this.onStatus(s, detail); }
    connect() {
      clearTimeout(this.retry);
      this.closedOnPurpose = false;
      this.status('connecting');
      let ws;
      try { ws = new WebSocket(`ws://${this.host}:${this.port}`, 'obswebsocket.json'); }
      catch (e) { this.status('error', e.message); return this.scheduleRetry(); }
      this.ws = ws;
      ws.onmessage = ev => {
        let msg; try { msg = JSON.parse(ev.data); } catch { return; }
        if (msg.op === 0) {                                   // Hello
          const d = { rpcVersion: 1, eventSubscriptions: this.subs };
          if (msg.d.authentication) {
            const { salt, challenge } = msg.d.authentication;
            d.authentication = sha256b64(sha256b64(this.password + salt) + challenge);
          }
          ws.send(JSON.stringify({ op: 1, d }));              // Identify
        } else if (msg.op === 2) {                            // Identified
          this.ready = true; this.status('connected');
        } else if (msg.op === 5) {                            // Event
          const { eventType, eventData = {} } = msg.d;
          if (eventType === 'CustomEvent') {
            if (eventData.channel === CHANNEL && this.onMessage) this.onMessage(eventData);
          } else if (this.onEvent) this.onEvent(eventType, eventData);
        } else if (msg.op === 7) {                            // RequestResponse
          const p = this.pending.get(msg.d.requestId);
          if (!p) return;
          this.pending.delete(msg.d.requestId);
          const st = msg.d.requestStatus;
          if (st.result) p.resolve(msg.d.responseData || {});
          else p.reject(Object.assign(new Error(st.comment || `OBS refused ${msg.d.requestType} (code ${st.code})`), { code: st.code }));
        }
      };
      ws.onclose = ev => {
        this.ready = false;
        this.pending.forEach(p => p.reject(new Error('Lost connection to OBS')));
        this.pending.clear();
        if (ev.code === 4009) { this.status('badpassword'); return; }
        this.status('disconnected');
        if (!this.closedOnPurpose) this.scheduleRetry();
      };
      ws.onerror = () => {};
    }
    scheduleRetry() { this.retry = setTimeout(() => this.connect(), 3000); }
    close() { this.closedOnPurpose = true; clearTimeout(this.retry); if (this.ws) this.ws.close(); }

    call(requestType, requestData) {
      if (!this.ready) return Promise.reject(new Error('Not connected to OBS'));
      const requestId = 'vcl-' + (++this.reqId);
      return new Promise((resolve, reject) => {
        this.pending.set(requestId, { resolve, reject });
        this.ws.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData: requestData || {} } }));
        setTimeout(() => { if (this.pending.has(requestId)) { this.pending.delete(requestId); reject(new Error('OBS did not answer')); } }, 8000);
      });
    }
    // Send a message to every on-air page (board, ticker) through OBS.
    send(payload) {
      if (!this.ready) return false;
      this.call('BroadcastCustomEvent', { eventData: Object.assign({ channel: CHANNEL }, payload) }).catch(() => {});
      return true;
    }
  }
  window.ObsLink = ObsLink;

  // Remember the last state an on-air page showed, so it comes back after OBS restarts.
  window.vclMemory = {
    get(k) { try { return JSON.parse(localStorage.getItem('vcl.onair.' + k) || 'null'); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('vcl.onair.' + k, JSON.stringify(v)); } catch {} }
  };
})();
