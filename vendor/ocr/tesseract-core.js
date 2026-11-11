/* WASM extracted unchanged from the original embedded bundle. Loaded by ocr-worker.js. */
var TesseractCore = (() => {
  var _scriptName = typeof document != "undefined" ? document.currentScript?.src : undefined;
  return async function (moduleArg = {}) {
    var moduleRtn;
    var e = moduleArg,
      aa = "object" == typeof window,
      ba = "undefined" != typeof WorkerGlobalScope,
      ca = "object" == typeof process && process.versions?.node && "renderer" != process.type,
      da = "./this.program",
      ea = (a, b) => {
        throw b;
      };
    "undefined" != typeof __filename ? (_scriptName = __filename) : ba && (_scriptName = self.location.href);
    var fa, ha;
    if (ca) {
      var fs = require("fs");
      ha = (a) => {
        a = ia(a) ? new URL(a) : a;
        return fs.readFileSync(a);
      };
      fa = async (a) => {
        a = ia(a) ? new URL(a) : a;
        return fs.readFileSync(a, void 0);
      };
      1 < process.argv.length && (da = process.argv[1].replace(/\\/g, "/"));
      process.argv.slice(2);
      ea = (a, b) => {
        process.exitCode = a;
        throw b;
      };
    } else if (aa || ba) {
      try {
        new URL(".", _scriptName);
      } catch {}
      ba &&
        (ha = (a) => {
          var b = new XMLHttpRequest();
          b.open("GET", a, !1);
          b.responseType = "arraybuffer";
          b.send(null);
          return new Uint8Array(b.response);
        });
      fa = async (a) => {
        if (ia(a))
          return new Promise((c, d) => {
            var f = new XMLHttpRequest();
            f.open("GET", a, !0);
            f.responseType = "arraybuffer";
            f.onload = () => {
              200 == f.status || (0 == f.status && f.response) ? c(f.response) : d(f.status);
            };
            f.onerror = d;
            f.send(null);
          });
        var b = await fetch(a, { credentials: "same-origin" });
        if (b.ok) return b.arrayBuffer();
        throw Error(b.status + " : " + b.url);
      };
    }
    var ja = console.log.bind(console),
      ka = console.error.bind(console),
      la,
      ma = !1,
      ia = (a) => a.startsWith("file://"),
      na,
      oa,
      pa,
      g,
      l,
      qa,
      n,
      p,
      ra,
      sa,
      ta,
      ua = !1;
    function va() {
      var a = pa.buffer;
      g = new Int8Array(a);
      qa = new Int16Array(a);
      l = new Uint8Array(a);
      new Uint16Array(a);
      n = new Int32Array(a);
      p = new Uint32Array(a);
      ra = new Float32Array(a);
      sa = new Float64Array(a);
      ta = new BigInt64Array(a);
      new BigUint64Array(a);
    }
    function r(a) {
      e.onAbort?.(a);
      a = "Aborted(" + a + ")";
      ka(a);
      ma = !0;
      a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
      oa?.(a);
      throw a;
    }
    var wa;
    async function xa(a) {
      if (!ArrayBuffer.isView(a))
        if (a == wa && la) a = new Uint8Array(la);
        else if (ha) a = ha(a);
        else throw "both async and sync fetching of the wasm failed";
      return a;
    }
    async function ya(a) {
      var b = wa;
      try {
        var c = await xa(b);
        return await WebAssembly.instantiate(c, a);
      } catch (d) {
        (ka(`failed to asynchronously prepare wasm: ${d}`), r(d));
      }
    }
    async function za(a) {
      return ya(a);
    }
    class Aa {
      name = "ExitStatus";
      constructor(a) {
        this.message = `Program terminated with exit(${a})`;
        this.status = a;
      }
    }
    var Ba = (a) => {
        for (; 0 < a.length;) a.shift()(e);
      },
      Ca = [],
      Da = [],
      Ea = () => {
        var a = e.preRun.shift();
        Da.push(a);
      },
      Ga = (a) => {
        if (ca) return ((a = Buffer.from(a, "base64")), new Uint8Array(a.buffer, a.byteOffset, a.length));
        for (
          var b,
            c,
            d = 0,
            f = 0,
            h = a.length,
            k = new Uint8Array(((3 * h) >> 2) - ("=" == a[h - 2]) - ("=" == a[h - 1]));
          d < h;
          d += 4, f += 3
        )
          ((b = Fa[a.charCodeAt(d + 1)]),
            (c = Fa[a.charCodeAt(d + 2)]),
            (k[f] = (Fa[a.charCodeAt(d)] << 2) | (b >> 4)),
            (k[f + 1] = (b << 4) | (c >> 2)),
            (k[f + 2] = (c << 6) | Fa[a.charCodeAt(d + 3)]));
        return k;
      };
    function Ha(a, b = "i8") {
      b.endsWith("*") && (b = "*");
      switch (b) {
        case "i1":
          return g[a];
        case "i8":
          return g[a];
        case "i16":
          return qa[a >> 1];
        case "i32":
          return n[a >> 2];
        case "i64":
          return ta[a >> 3];
        case "float":
          return ra[a >> 2];
        case "double":
          return sa[a >> 3];
        case "*":
          return p[a >> 2];
        default:
          r(`invalid type for getValue: ${b}`);
      }
    }
    var Ia = !0;
    function Ja(a, b, c = "i8") {
      c.endsWith("*") && (c = "*");
      switch (c) {
        case "i1":
          g[a] = b;
          break;
        case "i8":
          g[a] = b;
          break;
        case "i16":
          qa[a >> 1] = b;
          break;
        case "i32":
          n[a >> 2] = b;
          break;
        case "i64":
          ta[a >> 3] = BigInt(b);
          break;
        case "float":
          ra[a >> 2] = b;
          break;
        case "double":
          sa[a >> 3] = b;
          break;
        case "*":
          p[a >> 2] = b;
          break;
        default:
          r(`invalid type for setValue: ${c}`);
      }
    }
    var Ka = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0,
      v = (a, b = 0) => {
        var c = b;
        for (var d = c + void 0; a[c] && !(c >= d);) ++c;
        if (16 < c - b && a.buffer && Ka) return Ka.decode(a.subarray(b, c));
        for (d = ""; b < c;) {
          var f = a[b++];
          if (f & 128) {
            var h = a[b++] & 63;
            if (192 == (f & 224)) d += String.fromCharCode(((f & 31) << 6) | h);
            else {
              var k = a[b++] & 63;
              f =
                224 == (f & 240)
                  ? ((f & 15) << 12) | (h << 6) | k
                  : ((f & 7) << 18) | (h << 12) | (k << 6) | (a[b++] & 63);
              65536 > f
                ? (d += String.fromCharCode(f))
                : ((f -= 65536), (d += String.fromCharCode(55296 | (f >> 10), 56320 | (f & 1023))));
            }
          } else d += String.fromCharCode(f);
        }
        return d;
      },
      w = (a) => (a ? v(l, a) : "");
    class La {
      constructor(a) {
        this.Df = a - 24;
      }
      hg(a, b) {
        p[(this.Df + 16) >> 2] = 0;
        p[(this.Df + 4) >> 2] = a;
        p[(this.Df + 8) >> 2] = b;
      }
    }
    var Ma = 0,
      Na = 0,
      Ra = () => {
        var a = n[+Oa >> 2];
        Oa += 4;
        return a;
      },
      Sa = (a, b) => {
        for (var c = 0, d = a.length - 1; 0 <= d; d--) {
          var f = a[d];
          "." === f ? a.splice(d, 1) : ".." === f ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
        }
        if (b) for (; c; c--) a.unshift("..");
        return a;
      },
      Ta = (a) => {
        var b = "/" === a.charAt(0),
          c = "/" === a.slice(-1);
        (a = Sa(
          a.split("/").filter((d) => !!d),
          !b,
        ).join("/")) ||
          b ||
          (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      },
      Ua = (a) => {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b) return ".";
        b &&= b.slice(0, -1);
        return a + b;
      },
      Va = (a) => a && a.match(/([^\/]+|\/)\/*$/)[1],
      Wa = (a, b) => Ta(a + "/" + b),
      Xa = () => {
        if (ca) {
          var a = require("crypto");
          return (b) => a.randomFillSync(b);
        }
        return (b) => crypto.getRandomValues(b);
      },
      Za = (a) => {
        (Za = Xa())(a);
      },
      $a = (...a) => {
        for (var b = "", c = !1, d = a.length - 1; -1 <= d && !c; d--) {
          c = 0 <= d ? a[d] : x.cwd();
          if ("string" != typeof c) throw new TypeError("Arguments to path.resolve must be strings");
          if (!c) return "";
          b = c + "/" + b;
          c = "/" === c.charAt(0);
        }
        b = Sa(
          b.split("/").filter((f) => !!f),
          !c,
        ).join("/");
        return (c ? "/" : "") + b || ".";
      },
      ab = (a, b) => {
        function c(k) {
          for (var m = 0; m < k.length && "" === k[m]; m++);
          for (var u = k.length - 1; 0 <= u && "" === k[u]; u--);
          return m > u ? [] : k.slice(m, u - m + 1);
        }
        a = $a(a).slice(1);
        b = $a(b).slice(1);
        a = c(a.split("/"));
        b = c(b.split("/"));
        for (var d = Math.min(a.length, b.length), f = d, h = 0; h < d; h++)
          if (a[h] !== b[h]) {
            f = h;
            break;
          }
        d = [];
        for (h = f; h < a.length; h++) d.push("..");
        d = d.concat(b.slice(f));
        return d.join("/");
      },
      bb = [],
      cb = (a) => {
        for (var b = 0, c = 0; c < a.length; ++c) {
          var d = a.charCodeAt(c);
          127 >= d ? b++ : 2047 >= d ? (b += 2) : 55296 <= d && 57343 >= d ? ((b += 4), ++c) : (b += 3);
        }
        return b;
      },
      db = (a, b, c, d) => {
        if (!(0 < d)) return 0;
        var f = c;
        d = c + d - 1;
        for (var h = 0; h < a.length; ++h) {
          var k = a.codePointAt(h);
          if (127 >= k) {
            if (c >= d) break;
            b[c++] = k;
          } else if (2047 >= k) {
            if (c + 1 >= d) break;
            b[c++] = 192 | (k >> 6);
            b[c++] = 128 | (k & 63);
          } else if (65535 >= k) {
            if (c + 2 >= d) break;
            b[c++] = 224 | (k >> 12);
            b[c++] = 128 | ((k >> 6) & 63);
            b[c++] = 128 | (k & 63);
          } else {
            if (c + 3 >= d) break;
            b[c++] = 240 | (k >> 18);
            b[c++] = 128 | ((k >> 12) & 63);
            b[c++] = 128 | ((k >> 6) & 63);
            b[c++] = 128 | (k & 63);
            h++;
          }
        }
        b[c] = 0;
        return c - f;
      },
      eb = (a, b) => {
        var c = Array(cb(a) + 1);
        a = db(a, c, 0, c.length);
        b && (c.length = a);
        return c;
      },
      fb = [];
    function gb(a, b) {
      fb[a] = { input: [], output: [], Xf: b };
      hb(a, ib);
    }
    var ib = {
        open(a) {
          var b = fb[a.node.rdev];
          if (!b) throw new x.Ef(43);
          a.tty = b;
          a.seekable = !1;
        },
        close(a) {
          a.tty.Xf.fsync(a.tty);
        },
        fsync(a) {
          a.tty.Xf.fsync(a.tty);
        },
        read(a, b, c, d) {
          if (!a.tty || !a.tty.Xf.Fg) throw new x.Ef(60);
          for (var f = 0, h = 0; h < d; h++) {
            try {
              var k = a.tty.Xf.Fg(a.tty);
            } catch (m) {
              throw new x.Ef(29);
            }
            if (void 0 === k && 0 === f) throw new x.Ef(6);
            if (null === k || void 0 === k) break;
            f++;
            b[c + h] = k;
          }
          f && (a.node.atime = Date.now());
          return f;
        },
        write(a, b, c, d) {
          if (!a.tty || !a.tty.Xf.wg) throw new x.Ef(60);
          try {
            for (var f = 0; f < d; f++) a.tty.Xf.wg(a.tty, b[c + f]);
          } catch (h) {
            throw new x.Ef(29);
          }
          d && (a.node.mtime = a.node.ctime = Date.now());
          return f;
        },
      },
      jb = {
        Fg() {
          a: {
            if (!bb.length) {
              var a = null;
              if (ca) {
                var b = Buffer.alloc(256),
                  c = 0,
                  d = process.stdin.fd;
                try {
                  c = fs.readSync(d, b, 0, 256);
                } catch (f) {
                  if (f.toString().includes("EOF")) c = 0;
                  else throw f;
                }
                0 < c && (a = b.slice(0, c).toString("utf-8"));
              } else
                "undefined" != typeof window &&
                  "function" == typeof window.prompt &&
                  ((a = window.prompt("Input: ")), null !== a && (a += "\n"));
              if (!a) {
                a = null;
                break a;
              }
              bb = eb(a, !0);
            }
            a = bb.shift();
          }
          return a;
        },
        wg(a, b) {
          null === b || 10 === b ? (ja(v(a.output)), (a.output = [])) : 0 != b && a.output.push(b);
        },
        fsync(a) {
          0 < a.output?.length && (ja(v(a.output)), (a.output = []));
        },
        ph() {
          return {
            Ch: 25856,
            Eh: 5,
            Bh: 191,
            Dh: 35387,
            Ah: [
              3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0,
            ],
          };
        },
        qh() {
          return 0;
        },
        rh() {
          return [24, 80];
        },
      },
      kb = {
        wg(a, b) {
          null === b || 10 === b ? (ka(v(a.output)), (a.output = [])) : 0 != b && a.output.push(b);
        },
        fsync(a) {
          0 < a.output?.length && (ka(v(a.output)), (a.output = []));
        },
      },
      mb = (a) => {
        a = 65536 * Math.ceil(a / 65536);
        var b = lb(65536, a);
        b && l.fill(0, b, b + a);
        return b;
      },
      y = {
        Tf: null,
        Kf() {
          return y.createNode(null, "/", 16895, 0);
        },
        createNode(a, b, c, d) {
          if (24576 === (c & 61440) || x.isFIFO(c)) throw new x.Ef(63);
          y.Tf ||
            (y.Tf = {
              dir: {
                node: {
                  Pf: y.Ff.Pf,
                  Rf: y.Ff.Rf,
                  lookup: y.Ff.lookup,
                  Wf: y.Ff.Wf,
                  rename: y.Ff.rename,
                  unlink: y.Ff.unlink,
                  rmdir: y.Ff.rmdir,
                  readdir: y.Ff.readdir,
                  symlink: y.Ff.symlink,
                },
                stream: { Nf: y.Gf.Nf },
              },
              file: {
                node: { Pf: y.Ff.Pf, Rf: y.Ff.Rf },
                stream: { Nf: y.Gf.Nf, read: y.Gf.read, write: y.Gf.write, bg: y.Gf.bg, eg: y.Gf.eg },
              },
              link: { node: { Pf: y.Ff.Pf, Rf: y.Ff.Rf, readlink: y.Ff.readlink }, stream: {} },
              Bg: { node: { Pf: y.Ff.Pf, Rf: y.Ff.Rf }, stream: x.Pg },
            });
          c = x.createNode(a, b, c, d);
          z(c.mode)
            ? ((c.Ff = y.Tf.dir.node), (c.Gf = y.Tf.dir.stream), (c.Hf = {}))
            : x.isFile(c.mode)
              ? ((c.Ff = y.Tf.file.node), (c.Gf = y.Tf.file.stream), (c.Mf = 0), (c.Hf = null))
              : 40960 === (c.mode & 61440)
                ? ((c.Ff = y.Tf.link.node), (c.Gf = y.Tf.link.stream))
                : 8192 === (c.mode & 61440) && ((c.Ff = y.Tf.Bg.node), (c.Gf = y.Tf.Bg.stream));
          c.atime = c.mtime = c.ctime = Date.now();
          a && ((a.Hf[b] = c), (a.atime = a.mtime = a.ctime = c.atime));
          return c;
        },
        Nh(a) {
          return a.Hf ? (a.Hf.subarray ? a.Hf.subarray(0, a.Mf) : new Uint8Array(a.Hf)) : new Uint8Array(0);
        },
        Ff: {
          Pf(a) {
            var b = {};
            b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
            b.ino = a.id;
            b.mode = a.mode;
            b.nlink = 1;
            b.uid = 0;
            b.gid = 0;
            b.rdev = a.rdev;
            z(a.mode)
              ? (b.size = 4096)
              : x.isFile(a.mode)
                ? (b.size = a.Mf)
                : 40960 === (a.mode & 61440)
                  ? (b.size = a.link.length)
                  : (b.size = 0);
            b.atime = new Date(a.atime);
            b.mtime = new Date(a.mtime);
            b.ctime = new Date(a.ctime);
            b.blksize = 4096;
            b.blocks = Math.ceil(b.size / b.blksize);
            return b;
          },
          Rf(a, b) {
            for (var c of ["mode", "atime", "mtime", "ctime"]) null != b[c] && (a[c] = b[c]);
            void 0 !== b.size &&
              ((b = b.size),
              a.Mf != b &&
                (0 == b
                  ? ((a.Hf = null), (a.Mf = 0))
                  : ((c = a.Hf),
                    (a.Hf = new Uint8Array(b)),
                    c && a.Hf.set(c.subarray(0, Math.min(b, a.Mf))),
                    (a.Mf = b))));
          },
          lookup() {
            y.lg || ((y.lg = new x.Ef(44)), (y.lg.stack = "<generic error, no stack>"));
            throw y.lg;
          },
          Wf(a, b, c, d) {
            return y.createNode(a, b, c, d);
          },
          rename(a, b, c) {
            try {
              var d = nb(b, c);
            } catch (h) {}
            if (d) {
              if (z(a.mode)) for (var f in d.Hf) throw new x.Ef(55);
              ob(d);
            }
            delete a.parent.Hf[a.name];
            b.Hf[c] = a;
            a.name = c;
            b.ctime = b.mtime = a.parent.ctime = a.parent.mtime = Date.now();
          },
          unlink(a, b) {
            delete a.Hf[b];
            a.ctime = a.mtime = Date.now();
          },
          rmdir(a, b) {
            var c = nb(a, b),
              d;
            for (d in c.Hf) throw new x.Ef(55);
            delete a.Hf[b];
            a.ctime = a.mtime = Date.now();
          },
          readdir(a) {
            return [".", "..", ...Object.keys(a.Hf)];
          },
          symlink(a, b, c) {
            a = y.createNode(a, b, 41471, 0);
            a.link = c;
            return a;
          },
          readlink(a) {
            if (40960 !== (a.mode & 61440)) throw new x.Ef(28);
            return a.link;
          },
        },
        Gf: {
          read(a, b, c, d, f) {
            var h = a.node.Hf;
            if (f >= a.node.Mf) return 0;
            a = Math.min(a.node.Mf - f, d);
            if (8 < a && h.subarray) b.set(h.subarray(f, f + a), c);
            else for (d = 0; d < a; d++) b[c + d] = h[f + d];
            return a;
          },
          write(a, b, c, d, f, h) {
            b.buffer === g.buffer && (h = !1);
            if (!d) return 0;
            a = a.node;
            a.mtime = a.ctime = Date.now();
            if (b.subarray && (!a.Hf || a.Hf.subarray)) {
              if (h) return ((a.Hf = b.subarray(c, c + d)), (a.Mf = d));
              if (0 === a.Mf && 0 === f) return ((a.Hf = b.slice(c, c + d)), (a.Mf = d));
              if (f + d <= a.Mf) return (a.Hf.set(b.subarray(c, c + d), f), d);
            }
            h = f + d;
            var k = a.Hf ? a.Hf.length : 0;
            k >= h ||
              ((h = Math.max(h, (k * (1048576 > k ? 2 : 1.125)) >>> 0)),
              0 != k && (h = Math.max(h, 256)),
              (k = a.Hf),
              (a.Hf = new Uint8Array(h)),
              0 < a.Mf && a.Hf.set(k.subarray(0, a.Mf), 0));
            if (a.Hf.subarray && b.subarray) a.Hf.set(b.subarray(c, c + d), f);
            else for (h = 0; h < d; h++) a.Hf[f + h] = b[c + h];
            a.Mf = Math.max(a.Mf, f + d);
            return d;
          },
          Nf(a, b, c) {
            1 === c ? (b += a.position) : 2 === c && x.isFile(a.node.mode) && (b += a.node.Mf);
            if (0 > b) throw new x.Ef(28);
            return b;
          },
          bg(a, b, c, d, f) {
            if (!x.isFile(a.node.mode)) throw new x.Ef(43);
            a = a.node.Hf;
            if (f & 2 || !a || a.buffer !== g.buffer) {
              d = !0;
              f = mb(b);
              if (!f) throw new x.Ef(48);
              if (a) {
                if (0 < c || c + b < a.length)
                  a.subarray ? (a = a.subarray(c, c + b)) : (a = Array.prototype.slice.call(a, c, c + b));
                g.set(a, f);
              }
            } else ((d = !1), (f = a.byteOffset));
            return { Df: f, Ag: d };
          },
          eg(a, b, c, d) {
            y.Gf.write(a, b, 0, d, c, !1);
            return 0;
          },
        },
      },
      pb = (a, b) => {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      },
      qb = async (a) => {
        a = await fa(a);
        return new Uint8Array(a);
      },
      rb = 0,
      sb = null,
      tb = () => {
        rb--;
        e.monitorRunDependencies?.(rb);
        if (0 == rb && sb) {
          var a = sb;
          sb = null;
          a();
        }
      },
      ub = () => {
        rb++;
        e.monitorRunDependencies?.(rb);
      },
      vb = [],
      wb = async (a, b) => {
        "undefined" != typeof Browser && Browser.hg();
        for (var c of vb) if (c.canHandle(b)) return c.handle(a, b);
        return a;
      },
      yb = async (a, b, c, d, f, h, k, m) => {
        var u = b ? $a(Ta(a + "/" + b)) : a,
          t = `cp ${u}`;
        ub(t);
        try {
          var C = c;
          "string" == typeof c && (C = await qb(c));
          C = await wb(C, u);
          m?.();
          h || xb(a, b, C, d, f, k);
        } finally {
          tb(t);
        }
      };
    function hb(a, b) {
      x.Dg[a] = { Gf: b };
    }
    function z(a) {
      return 16384 === (a & 61440);
    }
    function nb(a, b) {
      var c = z(a.mode) ? ((c = zb(a, "x")) ? c : a.Ff.lookup ? 0 : 2) : 54;
      if (c) throw new x.Ef(c);
      for (c = x.Sf[Ab(a.id, b)]; c; c = c.cg) {
        var d = c.name;
        if (c.parent.id === a.id && d === b) return c;
      }
      return x.lookup(a, b);
    }
    function ob(a) {
      var b = Ab(a.parent.id, a.name);
      if (x.Sf[b] === a) x.Sf[b] = a.cg;
      else
        for (b = x.Sf[b]; b;) {
          if (b.cg === a) {
            b.cg = a.cg;
            break;
          }
          b = b.cg;
        }
    }
    function xb(a, b, c, d, f, h) {
      var k = b;
      a && ((a = "string" == typeof a ? a : Bb(a)), (k = b ? Ta(a + "/" + b) : a));
      a = pb(d, f);
      k = x.create(k, a);
      if (c) {
        if ("string" == typeof c) {
          b = Array(c.length);
          d = 0;
          for (f = c.length; d < f; ++d) b[d] = c.charCodeAt(d);
          c = b;
        }
        x.chmod(k, a | 146);
        b = x.open(k, 577);
        x.write(b, c, 0, c.length, 0, h);
        x.close(b);
        x.chmod(k, a);
      }
    }
    function A(a, b = {}) {
      if (!a) throw new x.Ef(44);
      b.gg ?? (b.gg = !0);
      "/" === a.charAt(0) || (a = x.cwd() + "/" + a);
      var c = 0;
      a: for (; 40 > c; c++) {
        a = a.split("/").filter((m) => !!m);
        for (var d = x.root, f = "/", h = 0; h < a.length; h++) {
          var k = h === a.length - 1;
          if (k && b.parent) break;
          if ("." !== a[h])
            if (".." === a[h])
              if (((f = Ua(f)), x.tg(d))) {
                a = f + "/" + a.slice(h + 1).join("/");
                c--;
                continue a;
              } else d = d.parent;
            else {
              f = Ta(f + "/" + a[h]);
              try {
                d = nb(d, a[h]);
              } catch (m) {
                if (44 === m?.Lf && k && b.uh) return { path: f };
                throw m;
              }
              !d.Qf || (k && !b.gg) || (d = d.Qf.root);
              if (40960 === (d.mode & 61440) && (!k || b.Of)) {
                if (!d.Ff.readlink) throw new x.Ef(52);
                d = d.Ff.readlink(d);
                "/" === d.charAt(0) || (d = Ua(f) + "/" + d);
                a = d + "/" + a.slice(h + 1).join("/");
                continue a;
              }
            }
        }
        return { path: f, node: d };
      }
      throw new x.Ef(32);
    }
    function Bb(a) {
      for (var b; ;) {
        if (x.tg(a)) return ((a = a.Kf.Hg), b ? ("/" !== a[a.length - 1] ? `${a}/${b}` : a + b) : a);
        b = b ? `${a.name}/${b}` : a.name;
        a = a.parent;
      }
    }
    function Ab(a, b) {
      for (var c = 0, d = 0; d < b.length; d++) c = ((c << 5) - c + b.charCodeAt(d)) | 0;
      return ((a + c) >>> 0) % x.Sf.length;
    }
    function Cb(a) {
      var b = Ab(a.parent.id, a.name);
      a.cg = x.Sf[b];
      x.Sf[b] = a;
    }
    function Db(a) {
      var b = ["r", "w", "rw"][a & 3];
      a & 512 && (b += "w");
      return b;
    }
    function zb(a, b) {
      if (x.Gg) return 0;
      if (!b.includes("r") || a.mode & 292) {
        if ((b.includes("w") && !(a.mode & 146)) || (b.includes("x") && !(a.mode & 73))) return 2;
      } else return 2;
      return 0;
    }
    function Eb(a, b) {
      if (!z(a.mode)) return 54;
      try {
        return (nb(a, b), 20);
      } catch (c) {}
      return zb(a, "wx");
    }
    function Fb(a, b, c) {
      try {
        var d = nb(a, b);
      } catch (f) {
        return f.Lf;
      }
      if ((a = zb(a, "wx"))) return a;
      if (c) {
        if (!z(d.mode)) return 54;
        if (x.tg(d) || Bb(d) === x.cwd()) return 10;
      } else if (z(d.mode)) return 31;
      return 0;
    }
    function Gb(a, b) {
      if (!a) throw new x.Ef(b);
      return a;
    }
    function B(a) {
      a = x.Tg(a);
      if (!a) throw new x.Ef(8);
      return a;
    }
    function Hb(a, b = -1) {
      a = Object.assign(new x.Mg(), a);
      if (-1 == b)
        a: {
          for (b = 0; b <= x.Og; b++) if (!x.streams[b]) break a;
          throw new x.Ef(33);
        }
      a.fd = b;
      return (x.streams[b] = a);
    }
    function Ib(a, b = -1) {
      a = Hb(a, b);
      a.Gf?.Hh?.(a);
      return a;
    }
    function Jb(a, b, c) {
      var d = a?.Gf.Rf;
      a = d ? a : b;
      d ??= b.Ff.Rf;
      Gb(d, 63);
      d(a, c);
    }
    function Kb(a) {
      var b = [];
      for (a = [a]; a.length;) {
        var c = a.pop();
        b.push(c);
        a.push(...c.fg);
      }
      return b;
    }
    function Lb(a) {
      var b = {
        zh: 4096,
        Kh: 4096,
        blocks: 1e6,
        yh: 5e5,
        xh: 5e5,
        files: x.vg,
        Ih: x.vg - 1,
        Lh: 42,
        flags: 2,
        Qh: 255,
      };
      a.Ff.Jg && Object.assign(b, a.Ff.Jg(a.Kf.vh.root));
      return b;
    }
    function Mb(a, b, c) {
      "undefined" == typeof c && ((c = b), (b = 438));
      return x.Wf(a, b | 8192, c);
    }
    function Nb(a, b, c, d) {
      Jb(a, b, { mode: (c & 4095) | (b.mode & -4096), ctime: Date.now(), Eg: d });
    }
    function Ob(a, b, c) {
      if (z(b.mode)) throw new x.Ef(31);
      if (!x.isFile(b.mode)) throw new x.Ef(28);
      var d = zb(b, "w");
      if (d) throw new x.Ef(d);
      Jb(a, b, { size: c, timestamp: Date.now() });
    }
    function Pb(a, b) {
      a = "string" == typeof a ? a : Bb(a);
      for (b = b.split("/").reverse(); b.length;) {
        var c = b.pop();
        if (c) {
          var d = Ta(a + "/" + c);
          try {
            x.mkdir(d);
          } catch (f) {
            if (20 != f.Lf) throw f;
          }
          a = d;
        }
      }
      return d;
    }
    function Qb(a, b, c, d) {
      a = "string" == typeof a ? a : Bb(a);
      b = Ta(a + "/" + b);
      return x.create(b, pb(c, d));
    }
    function Rb(a) {
      if (!(a.sh || a.th || a.link || a.Hf))
        if ("undefined" != typeof XMLHttpRequest)
          r(
            "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.",
          );
        else
          try {
            a.Hf = ha(a.url);
          } catch (b) {
            throw new x.Ef(29);
          }
    }
    function Sb(a, b, c, d, f) {
      function h(q, K, X, Y, W) {
        q = q.node.Hf;
        if (W >= q.length) return 0;
        Y = Math.min(q.length - W, Y);
        if (q.slice) for (var U = 0; U < Y; U++) K[X + U] = q[W + U];
        else for (U = 0; U < Y; U++) K[X + U] = q.get(W + U);
        return Y;
      }
      class k {
        kg = !1;
        Uf = [];
        jg = void 0;
        yg = 0;
        xg = 0;
        get(q) {
          if (!(q > this.length - 1 || 0 > q)) {
            var K = q % this.chunkSize;
            return this.jg((q / this.chunkSize) | 0)[K];
          }
        }
        Ng(q) {
          this.jg = q;
        }
        zg() {
          var q = new XMLHttpRequest();
          q.open("HEAD", c, !1);
          q.send(null);
          (200 <= q.status && 300 > q.status) ||
            304 === q.status ||
            r("Couldn't load " + c + ". Status: " + q.status);
          var K = Number(q.getResponseHeader("Content-length")),
            X,
            Y = (X = q.getResponseHeader("Accept-Ranges")) && "bytes" === X;
          q = (X = q.getResponseHeader("Content-Encoding")) && "gzip" === X;
          var W = 1048576;
          Y || (W = K);
          var U = this;
          U.Ng((Pa) => {
            var Ya = Pa * W,
              Qa = (Pa + 1) * W - 1;
            Qa = Math.min(Qa, K - 1);
            if ("undefined" == typeof U.Uf[Pa]) {
              var ni = U.Uf;
              Ya > Qa && r("invalid range (" + Ya + ", " + Qa + ") or no bytes requested!");
              Qa > K - 1 && r("only " + K + " bytes available! programmer error!");
              var Z = new XMLHttpRequest();
              Z.open("GET", c, !1);
              K !== W && Z.setRequestHeader("Range", "bytes=" + Ya + "-" + Qa);
              Z.responseType = "arraybuffer";
              Z.overrideMimeType && Z.overrideMimeType("text/plain; charset=x-user-defined");
              Z.send(null);
              (200 <= Z.status && 300 > Z.status) ||
                304 === Z.status ||
                r("Couldn't load " + c + ". Status: " + Z.status);
              Ya = void 0 !== Z.response ? new Uint8Array(Z.response || []) : eb(Z.responseText || "", !0);
              ni[Pa] = Ya;
            }
            "undefined" == typeof U.Uf[Pa] && r("doXHR failed!");
            return U.Uf[Pa];
          });
          if (q || !K)
            ((W = K = 1),
              (W = K = this.jg(0).length),
              ja("LazyFiles on gzip forces download of the whole file when length is accessed"));
          this.yg = K;
          this.xg = W;
          this.kg = !0;
        }
        get length() {
          this.kg || this.zg();
          return this.yg;
        }
        get chunkSize() {
          this.kg || this.zg();
          return this.xg;
        }
      }
      if ("undefined" != typeof XMLHttpRequest) {
        ba ||
          r(
            "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc",
          );
        var m = new k();
        var u = void 0;
      } else ((u = c), (m = void 0));
      var t = Qb(a, b, d, f);
      m ? (t.Hf = m) : u && ((t.Hf = null), (t.url = u));
      Object.defineProperties(t, {
        Mf: {
          get: function () {
            return this.Hf.length;
          },
        },
      });
      var C = {};
      Object.keys(t.Gf).forEach((q) => {
        var K = t.Gf[q];
        C[q] = (...X) => {
          Rb(t);
          return K(...X);
        };
      });
      C.read = (q, K, X, Y, W) => {
        Rb(t);
        return h(q, K, X, Y, W);
      };
      C.bg = (q, K, X) => {
        Rb(t);
        var Y = mb(K);
        if (!Y) throw new x.Ef(48);
        h(q, g, Y, K, X);
        return { Df: Y, Ag: !0 };
      };
      t.Gf = C;
      return t;
    }
    var x = {
      root: null,
      fg: [],
      Dg: {},
      streams: [],
      vg: 1,
      Sf: null,
      Cg: "/",
      rg: !1,
      Gg: !0,
      Rg: null,
      ig: 0,
      Ig: {},
      Ef: class {
        name = "ErrnoError";
        constructor(a) {
          this.Lf = a;
        }
      },
      Mg: class {
        Uf = {};
        node = null;
        get object() {
          return this.node;
        }
        set object(a) {
          this.node = a;
        }
        get flags() {
          return this.Uf.flags;
        }
        set flags(a) {
          this.Uf.flags = a;
        }
        get position() {
          return this.Uf.position;
        }
        set position(a) {
          this.Uf.position = a;
        }
      },
      Lg: class {
        Ff = {};
        Gf = {};
        Qf = null;
        constructor(a, b, c, d) {
          a ||= this;
          this.parent = a;
          this.Kf = a.Kf;
          this.id = x.vg++;
          this.name = b;
          this.mode = c;
          this.rdev = d;
          this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return 365 === (this.mode & 365);
        }
        set read(a) {
          a ? (this.mode |= 365) : (this.mode &= -366);
        }
        get write() {
          return 146 === (this.mode & 146);
        }
        set write(a) {
          a ? (this.mode |= 146) : (this.mode &= -147);
        }
        get th() {
          return z(this.mode);
        }
        get sh() {
          return 8192 === (this.mode & 61440);
        }
      },
      createNode(a, b, c, d) {
        a = new x.Lg(a, b, c, d);
        Cb(a);
        return a;
      },
      tg(a) {
        return a === a.parent;
      },
      isFile(a) {
        return 32768 === (a & 61440);
      },
      isFIFO(a) {
        return 4096 === (a & 61440);
      },
      isSocket(a) {
        return 49152 === (a & 49152);
      },
      Og: 4096,
      Tg: (a) => x.streams[a],
      Pg: {
        open(a) {
          a.Gf = x.Sg(a.node.rdev).Gf;
          a.Gf.open?.(a);
        },
        Nf() {
          throw new x.Ef(70);
        },
      },
      ug: (a) => a >> 8,
      Oh: (a) => a & 255,
      ag: (a, b) => (a << 8) | b,
      Sg: (a) => x.Dg[a],
      Kg(a, b) {
        function c(k) {
          x.ig--;
          return b(k);
        }
        function d(k) {
          if (k) {
            if (!d.Qg) return ((d.Qg = !0), c(k));
          } else ++h >= f.length && c(null);
        }
        "function" == typeof a && ((b = a), (a = !1));
        x.ig++;
        1 < x.ig &&
          ka(`warning: ${x.ig} FS.syncfs operations in flight at once, probably just doing extra work`);
        var f = Kb(x.root.Kf),
          h = 0;
        f.forEach((k) => {
          if (!k.type.Kg) return d(null);
          k.type.Kg(k, a, d);
        });
      },
      Kf(a, b, c) {
        var d = "/" === c;
        if (d && x.root) throw new x.Ef(10);
        if (!d && c) {
          var f = A(c, { gg: !1 });
          c = f.path;
          f = f.node;
          if (f.Qf) throw new x.Ef(10);
          if (!z(f.mode)) throw new x.Ef(54);
        }
        b = { type: a, vh: b, Hg: c, fg: [] };
        a = a.Kf(b);
        a.Kf = b;
        b.root = a;
        d ? (x.root = a) : f && ((f.Qf = b), f.Kf && f.Kf.fg.push(b));
        return a;
      },
      Uh(a) {
        a = A(a, { gg: !1 });
        if (!a.node.Qf) throw new x.Ef(28);
        a = a.node;
        var b = a.Qf,
          c = Kb(b);
        Object.keys(x.Sf).forEach((d) => {
          for (d = x.Sf[d]; d;) {
            var f = d.cg;
            c.includes(d.Kf) && ob(d);
            d = f;
          }
        });
        a.Qf = null;
        a.Kf.fg.splice(a.Kf.fg.indexOf(b), 1);
      },
      lookup(a, b) {
        return a.Ff.lookup(a, b);
      },
      Wf(a, b, c) {
        var d = A(a, { parent: !0 }).node;
        a = Va(a);
        if (!a) throw new x.Ef(28);
        if ("." === a || ".." === a) throw new x.Ef(20);
        var f = Eb(d, a);
        if (f) throw new x.Ef(f);
        if (!d.Ff.Wf) throw new x.Ef(63);
        return d.Ff.Wf(d, a, b, c);
      },
      Jg(a) {
        return Lb(A(a, { Of: !0 }).node);
      },
      Th(a) {
        return Lb(a.node);
      },
      create(a, b = 438) {
        return x.Wf(a, (b & 4095) | 32768, 0);
      },
      mkdir(a, b = 511) {
        return x.Wf(a, (b & 1023) | 16384, 0);
      },
      Ph(a, b) {
        var c = a.split("/"),
          d = "",
          f;
        for (f of c)
          if (f) {
            if (d || "/" === a.charAt(0)) d += "/";
            d += f;
            try {
              x.mkdir(d, b);
            } catch (h) {
              if (20 != h.Lf) throw h;
            }
          }
      },
      symlink(a, b) {
        if (!$a(a)) throw new x.Ef(44);
        var c = A(b, { parent: !0 }).node;
        if (!c) throw new x.Ef(44);
        b = Va(b);
        var d = Eb(c, b);
        if (d) throw new x.Ef(d);
        if (!c.Ff.symlink) throw new x.Ef(63);
        return c.Ff.symlink(c, b, a);
      },
      rename(a, b) {
        var c = Ua(a),
          d = Ua(b),
          f = Va(a),
          h = Va(b);
        var k = A(a, { parent: !0 });
        var m = k.node;
        k = A(b, { parent: !0 });
        k = k.node;
        if (!m || !k) throw new x.Ef(44);
        if (m.Kf !== k.Kf) throw new x.Ef(75);
        var u = nb(m, f);
        a = ab(a, d);
        if ("." !== a.charAt(0)) throw new x.Ef(28);
        a = ab(b, c);
        if ("." !== a.charAt(0)) throw new x.Ef(55);
        try {
          var t = nb(k, h);
        } catch (C) {}
        if (u !== t) {
          b = z(u.mode);
          if ((f = Fb(m, f, b))) throw new x.Ef(f);
          if ((f = t ? Fb(k, h, b) : Eb(k, h))) throw new x.Ef(f);
          if (!m.Ff.rename) throw new x.Ef(63);
          if (u.Qf || (t && t.Qf)) throw new x.Ef(10);
          if (k !== m && (f = zb(m, "w"))) throw new x.Ef(f);
          ob(u);
          try {
            (m.Ff.rename(u, k, h), (u.parent = k));
          } catch (C) {
            throw C;
          } finally {
            Cb(u);
          }
        }
      },
      rmdir(a) {
        var b = A(a, { parent: !0 }).node;
        a = Va(a);
        var c = nb(b, a),
          d = Fb(b, a, !0);
        if (d) throw new x.Ef(d);
        if (!b.Ff.rmdir) throw new x.Ef(63);
        if (c.Qf) throw new x.Ef(10);
        b.Ff.rmdir(b, a);
        ob(c);
      },
      readdir(a) {
        a = A(a, { Of: !0 }).node;
        return Gb(a.Ff.readdir, 54)(a);
      },
      unlink(a) {
        var b = A(a, { parent: !0 }).node;
        if (!b) throw new x.Ef(44);
        a = Va(a);
        var c = nb(b, a),
          d = Fb(b, a, !1);
        if (d) throw new x.Ef(d);
        if (!b.Ff.unlink) throw new x.Ef(63);
        if (c.Qf) throw new x.Ef(10);
        b.Ff.unlink(b, a);
        ob(c);
      },
      readlink(a) {
        a = A(a).node;
        if (!a) throw new x.Ef(44);
        if (!a.Ff.readlink) throw new x.Ef(28);
        return a.Ff.readlink(a);
      },
      stat(a, b) {
        a = A(a, { Of: !b }).node;
        return Gb(a.Ff.Pf, 63)(a);
      },
      fstat(a) {
        var b = B(a);
        a = b.node;
        var c = b.Gf.Pf;
        b = c ? b : a;
        c ??= a.Ff.Pf;
        Gb(c, 63);
        return c(b);
      },
      lstat(a) {
        return x.stat(a, !0);
      },
      chmod(a, b, c) {
        a = "string" == typeof a ? A(a, { Of: !c }).node : a;
        Nb(null, a, b, c);
      },
      lchmod(a, b) {
        x.chmod(a, b, !0);
      },
      fchmod(a, b) {
        a = B(a);
        Nb(a, a.node, b, !1);
      },
      chown(a, b, c, d) {
        a = "string" == typeof a ? A(a, { Of: !d }).node : a;
        Jb(null, a, { timestamp: Date.now(), Eg: d });
      },
      lchown(a, b, c) {
        x.chown(a, b, c, !0);
      },
      fchown(a) {
        a = B(a);
        Jb(a, a.node, { timestamp: Date.now(), Eg: !1 });
      },
      truncate(a, b) {
        if (0 > b) throw new x.Ef(28);
        a = "string" == typeof a ? A(a, { Of: !0 }).node : a;
        Ob(null, a, b);
      },
      Mh(a, b) {
        a = B(a);
        if (0 > b || 0 === (a.flags & 2097155)) throw new x.Ef(28);
        Ob(a, a.node, b);
      },
      Vh(a, b, c) {
        a = A(a, { Of: !0 }).node;
        Gb(a.Ff.Rf, 63)(a, { atime: b, mtime: c });
      },
      open(a, b, c = 438) {
        if ("" === a) throw new x.Ef(44);
        if ("string" == typeof b) {
          var d = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 }[b];
          if ("undefined" == typeof d) throw Error(`Unknown file open mode: ${b}`);
          b = d;
        }
        c = b & 64 ? (c & 4095) | 32768 : 0;
        if ("object" == typeof a) d = a;
        else {
          var f = a.endsWith("/");
          a = A(a, { Of: !(b & 131072), uh: !0 });
          d = a.node;
          a = a.path;
        }
        var h = !1;
        if (b & 64)
          if (d) {
            if (b & 128) throw new x.Ef(20);
          } else {
            if (f) throw new x.Ef(31);
            d = x.Wf(a, c | 511, 0);
            h = !0;
          }
        if (!d) throw new x.Ef(44);
        8192 === (d.mode & 61440) && (b &= -513);
        if (b & 65536 && !z(d.mode)) throw new x.Ef(54);
        if (
          !h &&
          (f = d
            ? 40960 === (d.mode & 61440)
              ? 32
              : z(d.mode) && ("r" !== Db(b) || b & 576)
                ? 31
                : zb(d, Db(b))
            : 44)
        )
          throw new x.Ef(f);
        b & 512 && !h && x.truncate(d, 0);
        b &= -131713;
        f = Hb({ node: d, path: Bb(d), flags: b, seekable: !0, position: 0, Gf: d.Gf, wh: [], error: !1 });
        f.Gf.open && f.Gf.open(f);
        h && x.chmod(d, c & 511);
        !e.logReadFiles || b & 1 || a in x.Ig || (x.Ig[a] = 1);
        return f;
      },
      close(a) {
        if (null === a.fd) throw new x.Ef(8);
        a.qg && (a.qg = null);
        try {
          a.Gf.close && a.Gf.close(a);
        } catch (b) {
          throw b;
        } finally {
          x.streams[a.fd] = null;
        }
        a.fd = null;
      },
      Nf(a, b, c) {
        if (null === a.fd) throw new x.Ef(8);
        if (!a.seekable || !a.Gf.Nf) throw new x.Ef(70);
        if (0 != c && 1 != c && 2 != c) throw new x.Ef(28);
        a.position = a.Gf.Nf(a, b, c);
        a.wh = [];
        return a.position;
      },
      read(a, b, c, d, f) {
        if (0 > d || 0 > f) throw new x.Ef(28);
        if (null === a.fd) throw new x.Ef(8);
        if (1 === (a.flags & 2097155)) throw new x.Ef(8);
        if (z(a.node.mode)) throw new x.Ef(31);
        if (!a.Gf.read) throw new x.Ef(28);
        var h = "undefined" != typeof f;
        if (!h) f = a.position;
        else if (!a.seekable) throw new x.Ef(70);
        b = a.Gf.read(a, b, c, d, f);
        h || (a.position += b);
        return b;
      },
      write(a, b, c, d, f, h) {
        if (0 > d || 0 > f) throw new x.Ef(28);
        if (null === a.fd) throw new x.Ef(8);
        if (0 === (a.flags & 2097155)) throw new x.Ef(8);
        if (z(a.node.mode)) throw new x.Ef(31);
        if (!a.Gf.write) throw new x.Ef(28);
        a.seekable && a.flags & 1024 && x.Nf(a, 0, 2);
        var k = "undefined" != typeof f;
        if (!k) f = a.position;
        else if (!a.seekable) throw new x.Ef(70);
        b = a.Gf.write(a, b, c, d, f, h);
        k || (a.position += b);
        return b;
      },
      bg(a, b, c, d, f) {
        if (0 !== (d & 2) && 0 === (f & 2) && 2 !== (a.flags & 2097155)) throw new x.Ef(2);
        if (1 === (a.flags & 2097155)) throw new x.Ef(2);
        if (!a.Gf.bg) throw new x.Ef(43);
        if (!b) throw new x.Ef(28);
        return a.Gf.bg(a, b, c, d, f);
      },
      eg(a, b, c, d, f) {
        return a.Gf.eg ? a.Gf.eg(a, b, c, d, f) : 0;
      },
      sg(a, b, c) {
        if (!a.Gf.sg) throw new x.Ef(59);
        return a.Gf.sg(a, b, c);
      },
      readFile(a, b = {}) {
        b.flags = b.flags || 0;
        b.encoding = b.encoding || "binary";
        "utf8" !== b.encoding && "binary" !== b.encoding && r(`Invalid encoding type "${b.encoding}"`);
        var c = x.open(a, b.flags);
        a = x.stat(a).size;
        var d = new Uint8Array(a);
        x.read(c, d, 0, a, 0);
        "utf8" === b.encoding && (d = v(d));
        x.close(c);
        return d;
      },
      writeFile(a, b, c = {}) {
        c.flags = c.flags || 577;
        a = x.open(a, c.flags, c.mode);
        "string" == typeof b && (b = new Uint8Array(eb(b, !0)));
        ArrayBuffer.isView(b) ? x.write(a, b, 0, b.byteLength, void 0, c.Fh) : r("Unsupported data type");
        x.close(a);
      },
      cwd: () => x.Cg,
      chdir(a) {
        a = A(a, { Of: !0 });
        if (null === a.node) throw new x.Ef(44);
        if (!z(a.node.mode)) throw new x.Ef(54);
        var b = zb(a.node, "x");
        if (b) throw new x.Ef(b);
        x.Cg = a.path;
      },
      hg(a, b, c) {
        x.rg = !0;
        a ??= e.stdin;
        b ??= e.stdout;
        c ??= e.stderr;
        a ? x.Yf("/dev", "stdin", a) : x.symlink("/dev/tty", "/dev/stdin");
        b ? x.Yf("/dev", "stdout", null, b) : x.symlink("/dev/tty", "/dev/stdout");
        c ? x.Yf("/dev", "stderr", null, c) : x.symlink("/dev/tty1", "/dev/stderr");
        x.open("/dev/stdin", 0);
        x.open("/dev/stdout", 1);
        x.open("/dev/stderr", 1);
      },
      Sh() {
        x.rg = !1;
        for (var a of x.streams) a && x.close(a);
      },
      Jh(a, b) {
        try {
          var c = A(a, { Of: !b });
          a = c.path;
        } catch (h) {}
        var d = !1,
          f = null;
        try {
          ((c = A(a, { parent: !0 })), Va(a), (c = A(a, { Of: !b })), (d = !0), (f = c.node));
        } catch (h) {}
        return d ? f : null;
      },
      Yf(a, b, c, d) {
        a = Wa("string" == typeof a ? a : Bb(a), b);
        b = pb(!!c, !!d);
        var f;
        (f = x.Yf).ug ?? (f.ug = 64);
        f = x.ag(x.Yf.ug++, 0);
        hb(f, {
          open(h) {
            h.seekable = !1;
          },
          close() {
            d?.buffer?.length && d(10);
          },
          read(h, k, m, u) {
            for (var t = 0, C = 0; C < u; C++) {
              try {
                var q = c();
              } catch (K) {
                throw new x.Ef(29);
              }
              if (void 0 === q && 0 === t) throw new x.Ef(6);
              if (null === q || void 0 === q) break;
              t++;
              k[m + C] = q;
            }
            t && (h.node.atime = Date.now());
            return t;
          },
          write(h, k, m, u) {
            for (var t = 0; t < u; t++)
              try {
                d(k[m + t]);
              } catch (C) {
                throw new x.Ef(29);
              }
            u && (h.node.mtime = h.node.ctime = Date.now());
            return t;
          },
        });
        return Mb(a, b, f);
      },
    };
    function Tb(a, b, c) {
      if ("/" === b.charAt(0)) return b;
      a = -100 === a ? x.cwd() : B(a).path;
      if (0 == b.length) {
        if (!c) throw new x.Ef(44);
        return a;
      }
      return a + "/" + b;
    }
    function Ub(a, b) {
      p[a >> 2] = b.dev;
      p[(a + 4) >> 2] = b.mode;
      p[(a + 8) >> 2] = b.nlink;
      p[(a + 12) >> 2] = b.uid;
      p[(a + 16) >> 2] = b.gid;
      p[(a + 20) >> 2] = b.rdev;
      ta[(a + 24) >> 3] = BigInt(b.size);
      n[(a + 32) >> 2] = 4096;
      n[(a + 36) >> 2] = b.blocks;
      var c = b.atime.getTime(),
        d = b.mtime.getTime(),
        f = b.ctime.getTime();
      ta[(a + 40) >> 3] = BigInt(Math.floor(c / 1e3));
      p[(a + 48) >> 2] = (c % 1e3) * 1e6;
      ta[(a + 56) >> 3] = BigInt(Math.floor(d / 1e3));
      p[(a + 64) >> 2] = (d % 1e3) * 1e6;
      ta[(a + 72) >> 3] = BigInt(Math.floor(f / 1e3));
      p[(a + 80) >> 2] = (f % 1e3) * 1e6;
      ta[(a + 88) >> 3] = BigInt(b.ino);
      return 0;
    }
    for (
      var Oa = void 0,
        Vb = (a) => 0 === a % 4 && (0 !== a % 100 || 0 === a % 400),
        Wb = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335],
        Xb = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        Yb = [],
        Zb = {},
        ac = () => {
          if (!$b) {
            var a = {
                USER: "web_user",
                LOGNAME: "web_user",
                PATH: "/",
                PWD: "/",
                HOME: "/home/web_user",
                LANG:
                  (("object" == typeof navigator && navigator.language) || "C").replace("-", "_") + ".UTF-8",
                _: da || "./this.program",
              },
              b;
            for (b in Zb) void 0 === Zb[b] ? delete a[b] : (a[b] = Zb[b]);
            var c = [];
            for (b in a) c.push(`${b}=${a[b]}`);
            $b = c;
          }
          return $b;
        },
        $b,
        bc = [],
        cc,
        dc = (a) => {
          var b = bc[a];
          b || (bc[a] = b = cc.get(a));
          return b;
        },
        Fa = new Uint8Array(123),
        ec = 25;
      0 <= ec;
      --ec
    )
      ((Fa[48 + ec] = 52 + ec), (Fa[65 + ec] = ec), (Fa[97 + ec] = 26 + ec));
    Fa[43] = 62;
    Fa[47] = 63;
    x.Gh = (a, b, c, d, f, h, k, m, u, t) => {
      yb(a, b, c, d, f, m, u, t).then(h).catch(k);
    };
    x.Rh = yb;
    x.Sf = Array(4096);
    x.Kf(y, {}, "/");
    x.mkdir("/tmp");
    x.mkdir("/home");
    x.mkdir("/home/web_user");
    (function () {
      x.mkdir("/dev");
      hb(x.ag(1, 3), { read: () => 0, write: (d, f, h, k) => k, Nf: () => 0 });
      Mb("/dev/null", x.ag(1, 3));
      gb(x.ag(5, 0), jb);
      gb(x.ag(6, 0), kb);
      Mb("/dev/tty", x.ag(5, 0));
      Mb("/dev/tty1", x.ag(6, 0));
      var a = new Uint8Array(1024),
        b = 0,
        c = () => {
          0 === b && (Za(a), (b = a.byteLength));
          return a[--b];
        };
      x.Yf("/dev", "random", c);
      x.Yf("/dev", "urandom", c);
      x.mkdir("/dev/shm");
      x.mkdir("/dev/shm/tmp");
    })();
    (function () {
      x.mkdir("/proc");
      var a = x.mkdir("/proc/self");
      x.mkdir("/proc/self/fd");
      x.Kf(
        {
          Kf() {
            var b = x.createNode(a, "fd", 16895, 73);
            b.Gf = { Nf: y.Gf.Nf };
            b.Ff = {
              lookup(c, d) {
                c = +d;
                var f = B(c);
                c = { parent: null, Kf: { Hg: "fake" }, Ff: { readlink: () => f.path }, id: c + 1 };
                return (c.parent = c);
              },
              readdir() {
                return Array.from(x.streams.entries())
                  .filter(([, c]) => c)
                  .map(([c]) => c.toString());
              },
            };
            return b;
          },
        },
        {},
        "/proc/self/fd",
      );
    })();
    x.Rg = { MEMFS: y };
    e.noExitRuntime && (Ia = e.noExitRuntime);
    e.preloadPlugins && (vb = e.preloadPlugins);
    e.print && (ja = e.print);
    e.printErr && (ka = e.printErr);
    e.wasmBinary && (la = e.wasmBinary);
    e.thisProgram && (da = e.thisProgram);
    if (e.preInit)
      for ("function" == typeof e.preInit && (e.preInit = [e.preInit]); 0 < e.preInit.length;)
        e.preInit.shift()();
    e.addRunDependency = ub;
    e.removeRunDependency = tb;
    e.setValue = Ja;
    e.getValue = Ha;
    e.FS_preloadFile = yb;
    e.FS_unlink = (...a) => x.unlink(...a);
    e.FS_createPath = (...a) => Pb(...a);
    e.FS_createDevice = (...a) => x.Yf(...a);
    e.FS = x;
    e.FS_createDataFile = (...a) => xb(...a);
    e.FS_createLazyFile = (...a) => Sb(...a);
    var fc = {
        408524: (a) => {
          e.TesseractProgress && e.TesseractProgress(a);
        },
        408593: (a) => {
          e.TesseractProgress && e.TesseractProgress(a);
        },
      },
      gc,
      hc,
      ic,
      jc,
      kc,
      lc,
      mc,
      nc,
      oc,
      pc,
      qc,
      rc,
      sc,
      tc,
      uc,
      vc,
      wc,
      xc,
      yc,
      zc,
      Ac,
      Bc,
      Cc,
      Dc,
      Ec,
      Fc,
      Gc,
      Hc,
      Ic,
      Jc,
      Kc,
      Lc,
      Mc,
      Nc,
      Oc,
      Pc,
      Qc,
      Rc,
      Sc,
      Tc,
      Uc,
      Vc,
      Wc,
      Xc,
      Yc,
      Zc,
      $c,
      ad,
      bd,
      cd,
      dd,
      ed,
      fd,
      gd,
      hd,
      jd,
      kd,
      ld,
      md,
      nd,
      od,
      pd,
      qd,
      rd,
      sd,
      td,
      ud,
      vd,
      wd,
      xd,
      yd,
      zd,
      Ad,
      Bd,
      Cd,
      Dd,
      Ed,
      Fd,
      Gd,
      Hd,
      Id,
      Jd,
      Kd,
      Ld,
      Md,
      Nd,
      Od,
      Pd,
      Qd,
      Rd,
      Sd,
      Td,
      Ud,
      Vd,
      Wd,
      Xd,
      Yd,
      Zd,
      $d,
      ae,
      be,
      ce,
      de,
      ee,
      fe,
      ge,
      he,
      ie,
      je,
      ke,
      le,
      me,
      ne,
      oe,
      pe,
      qe,
      re,
      se,
      te,
      ue,
      ve,
      we,
      xe,
      ye,
      ze,
      Ae,
      Be,
      Ce,
      De,
      Ee,
      Fe,
      Ge,
      He,
      Ie,
      Je,
      Ke,
      Le,
      Me,
      Ne,
      Oe,
      Pe,
      Qe,
      Re,
      Se,
      Te,
      Ue,
      Ve,
      We,
      Xe,
      Ye,
      Ze,
      $e,
      af,
      bf,
      cf,
      df,
      ef,
      ff,
      gf,
      hf,
      jf,
      kf,
      lf,
      mf,
      nf,
      of,
      pf,
      qf,
      rf,
      sf,
      tf,
      uf,
      vf,
      wf,
      xf,
      yf,
      zf,
      Af,
      Bf,
      Cf,
      Df,
      Ef,
      Ff,
      Gf,
      Hf,
      If,
      Jf,
      Kf,
      Lf,
      Mf,
      Nf,
      Of,
      Pf,
      Qf,
      Rf,
      Sf,
      Tf,
      Uf,
      Vf,
      Wf,
      Xf,
      Yf,
      Zf,
      $f,
      ag,
      bg,
      cg,
      dg,
      eg,
      fg,
      gg,
      hg,
      ig,
      jg,
      kg,
      lg,
      mg,
      ng,
      og,
      pg,
      qg,
      rg,
      sg,
      tg,
      ug,
      vg,
      wg,
      xg,
      yg,
      zg,
      Ag,
      Bg,
      Cg,
      Dg,
      Eg,
      Fg,
      Gg,
      Hg,
      Ig,
      Jg,
      Kg,
      Lg,
      Mg,
      Ng,
      Og,
      Pg,
      Qg,
      Rg,
      Sg,
      Tg,
      Ug,
      Vg,
      Wg,
      Xg,
      Yg,
      Zg,
      $g,
      ah,
      bh,
      ch,
      dh,
      eh,
      fh,
      gh,
      hh,
      ih,
      jh,
      kh,
      lh,
      mh,
      nh,
      oh,
      ph,
      qh,
      rh,
      sh,
      th,
      uh,
      vh,
      wh,
      xh,
      yh,
      zh,
      Ah,
      Bh,
      Ch,
      Dh,
      Eh,
      Fh,
      Gh,
      Hh,
      Ih,
      Jh,
      Kh,
      lb,
      Lh,
      Mh,
      Nh,
      Zh = {
        P: function () {
          r("missing function: _ZN9tesseract11TessBaseAPI10GetOsdTextEi");
        },
        S: function () {
          r("missing function: _ZN9tesseract11TessBaseAPI23ClearAdaptiveClassifierEv");
        },
        J: function () {
          r("missing function: _ZN9tesseract11TessBaseAPI8DetectOSEPNS_9OSResultsE");
        },
        y: function () {
          r("missing function: _ZNK9tesseract9OSResults12print_scoresEv");
        },
        a: (a, b, c, d) =>
          r(
            `Assertion failed: ${a ? v(l, a) : ""}, at: ` +
              [b ? (b ? v(l, b) : "") : "unknown filename", c, d ? (d ? v(l, d) : "") : "unknown function"],
          ),
        k: (a, b, c) => {
          new La(a).hg(b, c);
          Ma = a;
          Na++;
          throw Ma;
        },
        p: function (a, b, c) {
          Oa = c;
          try {
            var d = B(a);
            switch (b) {
              case 0:
                var f = Ra();
                if (0 > f) break;
                for (; x.streams[f];) f++;
                return Ib(d, f).fd;
              case 1:
              case 2:
                return 0;
              case 3:
                return d.flags;
              case 4:
                return ((f = Ra()), (d.flags |= f), 0);
              case 12:
                return ((f = Ra()), (qa[(f + 0) >> 1] = 2), 0);
              case 13:
              case 14:
                return 0;
            }
            return -28;
          } catch (h) {
            if ("undefined" == typeof x || "ErrnoError" !== h.name) throw h;
            return -h.Lf;
          }
        },
        K: function (a, b) {
          try {
            return Ub(b, x.fstat(a));
          } catch (c) {
            if ("undefined" == typeof x || "ErrnoError" !== c.name) throw c;
            return -c.Lf;
          }
        },
        H: function (a, b) {
          try {
            if (0 === b) return -28;
            var c = x.cwd(),
              d = cb(c) + 1;
            if (b < d) return -68;
            db(c, l, a, b);
            return d;
          } catch (f) {
            if ("undefined" == typeof x || "ErrnoError" !== f.name) throw f;
            return -f.Lf;
          }
        },
        O: function (a, b, c) {
          Oa = c;
          try {
            var d = B(a);
            switch (b) {
              case 21509:
                return d.tty ? 0 : -59;
              case 21505:
                if (!d.tty) return -59;
                if (d.tty.Xf.ph) {
                  a = [
                    3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0,
                  ];
                  var f = Ra();
                  n[f >> 2] = 25856;
                  n[(f + 4) >> 2] = 5;
                  n[(f + 8) >> 2] = 191;
                  n[(f + 12) >> 2] = 35387;
                  for (var h = 0; 32 > h; h++) g[f + h + 17] = a[h] || 0;
                }
                return 0;
              case 21510:
              case 21511:
              case 21512:
                return d.tty ? 0 : -59;
              case 21506:
              case 21507:
              case 21508:
                if (!d.tty) return -59;
                if (d.tty.Xf.qh) for (f = Ra(), a = [], h = 0; 32 > h; h++) a.push(g[f + h + 17]);
                return 0;
              case 21519:
                if (!d.tty) return -59;
                f = Ra();
                return (n[f >> 2] = 0);
              case 21520:
                return d.tty ? -28 : -59;
              case 21537:
              case 21531:
                return ((f = Ra()), x.sg(d, b, f));
              case 21523:
                if (!d.tty) return -59;
                d.tty.Xf.rh && ((h = [24, 80]), (f = Ra()), (qa[f >> 1] = h[0]), (qa[(f + 2) >> 1] = h[1]));
                return 0;
              case 21524:
                return d.tty ? 0 : -59;
              case 21515:
                return d.tty ? 0 : -59;
              default:
                return -28;
            }
          } catch (k) {
            if ("undefined" == typeof x || "ErrnoError" !== k.name) throw k;
            return -k.Lf;
          }
        },
        I: function (a, b, c, d) {
          try {
            b = b ? v(l, b) : "";
            var f = d & 256;
            b = Tb(a, b, d & 4096);
            return Ub(c, f ? x.lstat(b) : x.stat(b));
          } catch (h) {
            if ("undefined" == typeof x || "ErrnoError" !== h.name) throw h;
            return -h.Lf;
          }
        },
        n: function (a, b, c, d) {
          Oa = d;
          try {
            b = b ? v(l, b) : "";
            b = Tb(a, b);
            var f = d ? Ra() : 0;
            return x.open(b, c, f).fd;
          } catch (h) {
            if ("undefined" == typeof x || "ErrnoError" !== h.name) throw h;
            return -h.Lf;
          }
        },
        v: function (a) {
          try {
            return ((a = a ? v(l, a) : ""), x.rmdir(a), 0);
          } catch (b) {
            if ("undefined" == typeof x || "ErrnoError" !== b.name) throw b;
            return -b.Lf;
          }
        },
        w: function (a, b, c) {
          try {
            b = b ? v(l, b) : "";
            b = Tb(a, b);
            if (c)
              if (512 === c) x.rmdir(b);
              else return -28;
            else x.unlink(b);
            return 0;
          } catch (d) {
            if ("undefined" == typeof x || "ErrnoError" !== d.name) throw d;
            return -d.Lf;
          }
        },
        N: () => r(""),
        Q: (a) => {
          do {
            var b = p[a >> 2];
            a += 4;
            var c = p[a >> 2];
            a += 4;
            var d = p[a >> 2];
            a += 4;
            b = b ? v(l, b) : "";
            Pb("/", Ua(b));
            xb(b, null, g.subarray(d, d + c), !0, !0, !0);
          } while (p[a >> 2]);
        },
        t: () => {
          throw Infinity;
        },
        A: function (a, b) {
          a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
          a = new Date(1e3 * a);
          n[b >> 2] = a.getUTCSeconds();
          n[(b + 4) >> 2] = a.getUTCMinutes();
          n[(b + 8) >> 2] = a.getUTCHours();
          n[(b + 12) >> 2] = a.getUTCDate();
          n[(b + 16) >> 2] = a.getUTCMonth();
          n[(b + 20) >> 2] = a.getUTCFullYear() - 1900;
          n[(b + 24) >> 2] = a.getUTCDay();
          n[(b + 28) >> 2] = ((a.getTime() - Date.UTC(a.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5) | 0;
        },
        B: function (a, b) {
          a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
          a = new Date(1e3 * a);
          n[b >> 2] = a.getSeconds();
          n[(b + 4) >> 2] = a.getMinutes();
          n[(b + 8) >> 2] = a.getHours();
          n[(b + 12) >> 2] = a.getDate();
          n[(b + 16) >> 2] = a.getMonth();
          n[(b + 20) >> 2] = a.getFullYear() - 1900;
          n[(b + 24) >> 2] = a.getDay();
          n[(b + 28) >> 2] = ((Vb(a.getFullYear()) ? Wb : Xb)[a.getMonth()] + a.getDate() - 1) | 0;
          n[(b + 36) >> 2] = -(60 * a.getTimezoneOffset());
          var c = new Date(a.getFullYear(), 6, 1).getTimezoneOffset(),
            d = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
          n[(b + 32) >> 2] = (c != d && a.getTimezoneOffset() == Math.min(d, c)) | 0;
        },
        C: function (a) {
          var b = new Date(
              n[(a + 20) >> 2] + 1900,
              n[(a + 16) >> 2],
              n[(a + 12) >> 2],
              n[(a + 8) >> 2],
              n[(a + 4) >> 2],
              n[a >> 2],
              0,
            ),
            c = n[(a + 32) >> 2],
            d = b.getTimezoneOffset(),
            f = new Date(b.getFullYear(), 6, 1).getTimezoneOffset(),
            h = new Date(b.getFullYear(), 0, 1).getTimezoneOffset(),
            k = Math.min(h, f);
          0 > c
            ? (n[(a + 32) >> 2] = Number(f != h && k == d))
            : 0 < c != (k == d) &&
              ((f = Math.max(h, f)), b.setTime(b.getTime() + 6e4 * ((0 < c ? k : f) - d)));
          n[(a + 24) >> 2] = b.getDay();
          n[(a + 28) >> 2] = ((Vb(b.getFullYear()) ? Wb : Xb)[b.getMonth()] + b.getDate() - 1) | 0;
          n[a >> 2] = b.getSeconds();
          n[(a + 4) >> 2] = b.getMinutes();
          n[(a + 8) >> 2] = b.getHours();
          n[(a + 12) >> 2] = b.getDate();
          n[(a + 16) >> 2] = b.getMonth();
          n[(a + 20) >> 2] = b.getYear();
          a = b.getTime();
          return BigInt(isNaN(a) ? -1 : a / 1e3);
        },
        x: function (a, b, c, d, f, h, k) {
          f = -9007199254740992 > f || 9007199254740992 < f ? NaN : Number(f);
          try {
            var m = B(d),
              u = x.bg(m, a, f, b, c),
              t = u.Df;
            n[h >> 2] = u.Ag;
            p[k >> 2] = t;
            return 0;
          } catch (C) {
            if ("undefined" == typeof x || "ErrnoError" !== C.name) throw C;
            return -C.Lf;
          }
        },
        z: function (a, b, c, d, f, h) {
          h = -9007199254740992 > h || 9007199254740992 < h ? NaN : Number(h);
          try {
            var k = B(f);
            if (c & 2) {
              c = h;
              if (!x.isFile(k.node.mode)) throw new x.Ef(43);
              if (!(d & 2)) {
                var m = l.slice(a, a + b);
                x.eg(k, m, c, b, d);
              }
            }
          } catch (u) {
            if ("undefined" == typeof x || "ErrnoError" !== u.name) throw u;
            return -u.Lf;
          }
        },
        D: (a, b, c, d) => {
          var f = new Date().getFullYear(),
            h = new Date(f, 0, 1).getTimezoneOffset();
          f = new Date(f, 6, 1).getTimezoneOffset();
          p[a >> 2] = 60 * Math.max(h, f);
          n[b >> 2] = Number(h != f);
          b = (k) => {
            var m = Math.abs(k);
            return `UTC${0 <= k ? "-" : "+"}${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}`;
          };
          a = b(h);
          b = b(f);
          f < h ? (db(a, l, c, 17), db(b, l, d, 17)) : (db(a, l, d, 17), db(b, l, c, 17));
        },
        M: function (a, b, c) {
          if (!(0 <= a && 3 >= a)) return 28;
          ta[c >> 3] = BigInt(Math.round(1e6 * (0 === a ? Date.now() : performance.now())));
          return 0;
        },
        s: (a, b, c) => {
          Yb.length = 0;
          for (var d; (d = l[b++]);) {
            var f = 105 != d;
            f &= 112 != d;
            c += f && c % 8 ? 4 : 0;
            Yb.push(112 == d ? p[c >> 2] : 106 == d ? ta[c >> 3] : 105 == d ? n[c >> 2] : sa[c >> 3]);
            c += f ? 8 : 4;
          }
          return fc[a](...Yb);
        },
        L: () => Date.now(),
        u: (a) => {
          var b = l.length;
          a >>>= 0;
          if (2147483648 < a) return !1;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            a: {
              d =
                ((Math.min(2147483648, 65536 * Math.ceil(Math.max(a, d) / 65536)) -
                  pa.buffer.byteLength +
                  65535) /
                  65536) |
                0;
              try {
                pa.grow(d);
                va();
                var f = 1;
                break a;
              } catch (h) {}
              f = void 0;
            }
            if (f) return !0;
          }
          return !1;
        },
        F: (a, b) => {
          var c = 0,
            d = 0,
            f;
          for (f of ac()) {
            var h = b + c;
            p[(a + d) >> 2] = h;
            c += db(f, l, h, Infinity) + 1;
            d += 4;
          }
          return 0;
        },
        G: (a, b) => {
          var c = ac();
          p[a >> 2] = c.length;
          a = 0;
          for (var d of c) a += cb(d) + 1;
          p[b >> 2] = a;
          return 0;
        },
        R: (a) => {
          Ia || (e.onExit?.(a), (ma = !0));
          ea(a, new Aa(a));
        },
        m: function (a) {
          try {
            var b = B(a);
            x.close(b);
            return 0;
          } catch (c) {
            if ("undefined" == typeof x || "ErrnoError" !== c.name) throw c;
            return c.Lf;
          }
        },
        o: function (a, b, c, d) {
          try {
            a: {
              var f = B(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var m = p[a >> 2],
                  u = p[(a + 4) >> 2];
                a += 8;
                var t = x.read(f, g, m, u, h);
                if (0 > t) {
                  var C = -1;
                  break a;
                }
                b += t;
                if (t < u) break;
                "undefined" != typeof h && (h += t);
              }
              C = b;
            }
            p[d >> 2] = C;
            return 0;
          } catch (q) {
            if ("undefined" == typeof x || "ErrnoError" !== q.name) throw q;
            return q.Lf;
          }
        },
        E: function (a, b, c, d) {
          b = -9007199254740992 > b || 9007199254740992 < b ? NaN : Number(b);
          try {
            if (isNaN(b)) return 61;
            var f = B(a);
            x.Nf(f, b, c);
            ta[d >> 3] = BigInt(f.position);
            f.qg && 0 === b && 0 === c && (f.qg = null);
            return 0;
          } catch (h) {
            if ("undefined" == typeof x || "ErrnoError" !== h.name) throw h;
            return h.Lf;
          }
        },
        l: function (a, b, c, d) {
          try {
            a: {
              var f = B(a);
              a = b;
              for (var h, k = (b = 0); k < c; k++) {
                var m = p[a >> 2],
                  u = p[(a + 4) >> 2];
                a += 8;
                var t = x.write(f, g, m, u, h);
                if (0 > t) {
                  var C = -1;
                  break a;
                }
                b += t;
                if (t < u) break;
                "undefined" != typeof h && (h += t);
              }
              C = b;
            }
            p[d >> 2] = C;
            return 0;
          } catch (q) {
            if ("undefined" == typeof x || "ErrnoError" !== q.name) throw q;
            return q.Lf;
          }
        },
        c: Oh,
        e: Ph,
        b: Qh,
        h: Rh,
        i: Sh,
        d: Th,
        f: Uh,
        g: Vh,
        j: Wh,
        q: Xh,
        r: Yh,
      };
    function Qh(a, b, c, d) {
      var f = Nh();
      try {
        return dc(a)(b, c, d);
      } catch (h) {
        Mh(f);
        if (h !== h + 0) throw h;
        Lh(1, 0);
      }
    }
    function Th(a, b) {
      var c = Nh();
      try {
        dc(a)(b);
      } catch (d) {
        Mh(c);
        if (d !== d + 0) throw d;
        Lh(1, 0);
      }
    }
    function Oh(a, b) {
      var c = Nh();
      try {
        return dc(a)(b);
      } catch (d) {
        Mh(c);
        if (d !== d + 0) throw d;
        Lh(1, 0);
      }
    }
    function Vh(a, b, c, d) {
      var f = Nh();
      try {
        dc(a)(b, c, d);
      } catch (h) {
        Mh(f);
        if (h !== h + 0) throw h;
        Lh(1, 0);
      }
    }
    function Uh(a, b, c) {
      var d = Nh();
      try {
        dc(a)(b, c);
      } catch (f) {
        Mh(d);
        if (f !== f + 0) throw f;
        Lh(1, 0);
      }
    }
    function Ph(a, b, c) {
      var d = Nh();
      try {
        return dc(a)(b, c);
      } catch (f) {
        Mh(d);
        if (f !== f + 0) throw f;
        Lh(1, 0);
      }
    }
    function Rh(a, b, c, d, f) {
      var h = Nh();
      try {
        return dc(a)(b, c, d, f);
      } catch (k) {
        Mh(h);
        if (k !== k + 0) throw k;
        Lh(1, 0);
      }
    }
    function Wh(a, b, c, d, f) {
      var h = Nh();
      try {
        dc(a)(b, c, d, f);
      } catch (k) {
        Mh(h);
        if (k !== k + 0) throw k;
        Lh(1, 0);
      }
    }
    function Sh(a, b, c, d, f, h) {
      var k = Nh();
      try {
        return dc(a)(b, c, d, f, h);
      } catch (m) {
        Mh(k);
        if (m !== m + 0) throw m;
        Lh(1, 0);
      }
    }
    function Yh(a, b, c, d, f, h, k, m, u, t) {
      var C = Nh();
      try {
        dc(a)(b, c, d, f, h, k, m, u, t);
      } catch (q) {
        Mh(C);
        if (q !== q + 0) throw q;
        Lh(1, 0);
      }
    }
    function Xh(a, b, c, d, f, h) {
      var k = Nh();
      try {
        dc(a)(b, c, d, f, h);
      } catch (m) {
        Mh(k);
        if (m !== m + 0) throw m;
        Lh(1, 0);
      }
    }
    function $h() {
      function a() {
        e.calledRun = !0;
        if (!ma) {
          ua = !0;
          e.noFSInit || x.rg || x.hg();
          ai.U();
          x.Gg = !1;
          na?.(e);
          e.onRuntimeInitialized?.();
          if (e.postRun)
            for ("function" == typeof e.postRun && (e.postRun = [e.postRun]); e.postRun.length;) {
              var b = e.postRun.shift();
              Ca.push(b);
            }
          Ba(Ca);
        }
      }
      if (0 < rb) sb = $h;
      else {
        if (e.preRun) for ("function" == typeof e.preRun && (e.preRun = [e.preRun]); e.preRun.length;) Ea();
        Ba(Da);
        0 < rb
          ? (sb = $h)
          : e.setStatus
            ? (e.setStatus("Running..."),
              setTimeout(() => {
                setTimeout(() => e.setStatus(""), 1);
                a();
              }, 1))
            : a();
      }
    }
    var ai;
    ai = await (async function () {
      function a(c) {
        ai = c.exports;
        pa = ai.T;
        va();
        cc = ai.da;
        c = ai;
        e._emscripten_bind_ParagraphJustification___destroy___0 = gc = c.V;
        e._emscripten_bind_BoolPtr___destroy___0 = hc = c.W;
        e._emscripten_bind_TessResultRenderer_BeginDocument_1 = ic = c.X;
        e._emscripten_bind_TessResultRenderer_AddImage_1 = jc = c.Y;
        e._emscripten_bind_TessResultRenderer_EndDocument_0 = kc = c.Z;
        e._emscripten_bind_TessResultRenderer_happy_0 = lc = c._;
        e._emscripten_bind_TessResultRenderer_file_extension_0 = mc = c.$;
        e._emscripten_bind_TessResultRenderer_title_0 = nc = c.aa;
        e._emscripten_bind_TessResultRenderer_imagenum_0 = oc = c.ba;
        e._emscripten_bind_TessResultRenderer___destroy___0 = pc = c.ca;
        e._emscripten_bind_LongStarPtr___destroy___0 = qc = c.ea;
        e._emscripten_bind_VoidPtr___destroy___0 = rc = c.fa;
        e._emscripten_bind_ResultIterator_ResultIterator_1 = sc = c.ga;
        e._emscripten_bind_ResultIterator_Begin_0 = tc = c.ha;
        e._emscripten_bind_ResultIterator_RestartParagraph_0 = uc = c.ia;
        e._emscripten_bind_ResultIterator_IsWithinFirstTextlineOfParagraph_0 = vc = c.ja;
        e._emscripten_bind_ResultIterator_RestartRow_0 = wc = c.ka;
        e._emscripten_bind_ResultIterator_Next_1 = xc = c.la;
        e._emscripten_bind_ResultIterator_IsAtBeginningOf_1 = yc = c.ma;
        e._emscripten_bind_ResultIterator_IsAtFinalElement_2 = zc = c.na;
        e._emscripten_bind_ResultIterator_Cmp_1 = Ac = c.oa;
        e._emscripten_bind_ResultIterator_SetBoundingBoxComponents_2 = Bc = c.pa;
        e._emscripten_bind_ResultIterator_BoundingBox_5 = Cc = c.qa;
        e._emscripten_bind_ResultIterator_BoundingBox_6 = Dc = c.ra;
        e._emscripten_bind_ResultIterator_BoundingBoxInternal_5 = Ec = c.sa;
        e._emscripten_bind_ResultIterator_Empty_1 = Fc = c.ta;
        e._emscripten_bind_ResultIterator_BlockType_0 = Gc = c.ua;
        e._emscripten_bind_ResultIterator_BlockPolygon_0 = Hc = c.va;
        e._emscripten_bind_ResultIterator_GetBinaryImage_1 = Ic = c.wa;
        e._emscripten_bind_ResultIterator_GetImage_5 = Jc = c.xa;
        e._emscripten_bind_ResultIterator_Baseline_5 = Kc = c.ya;
        e._emscripten_bind_ResultIterator_RowAttributes_3 = Lc = c.za;
        e._emscripten_bind_ResultIterator_Orientation_4 = Mc = c.Aa;
        e._emscripten_bind_ResultIterator_ParagraphInfo_4 = Nc = c.Ba;
        e._emscripten_bind_ResultIterator_ParagraphIsLtr_0 = Oc = c.Ca;
        e._emscripten_bind_ResultIterator_GetUTF8Text_1 = Pc = c.Da;
        e._emscripten_bind_ResultIterator_SetLineSeparator_1 = Qc = c.Ea;
        e._emscripten_bind_ResultIterator_SetParagraphSeparator_1 = Rc = c.Fa;
        e._emscripten_bind_ResultIterator_Confidence_1 = Sc = c.Ga;
        e._emscripten_bind_ResultIterator_WordFontAttributes_8 = Tc = c.Ha;
        e._emscripten_bind_ResultIterator_WordRecognitionLanguage_0 = Uc = c.Ia;
        e._emscripten_bind_ResultIterator_WordDirection_0 = Vc = c.Ja;
        e._emscripten_bind_ResultIterator_WordIsFromDictionary_0 = Wc = c.Ka;
        e._emscripten_bind_ResultIterator_WordIsNumeric_0 = Xc = c.La;
        e._emscripten_bind_ResultIterator_HasBlamerInfo_0 = Yc = c.Ma;
        e._emscripten_bind_ResultIterator_HasTruthString_0 = Zc = c.Na;
        e._emscripten_bind_ResultIterator_EquivalentToTruth_1 = $c = c.Oa;
        e._emscripten_bind_ResultIterator_WordTruthUTF8Text_0 = ad = c.Pa;
        e._emscripten_bind_ResultIterator_WordNormedUTF8Text_0 = bd = c.Qa;
        e._emscripten_bind_ResultIterator_WordLattice_1 = cd = c.Ra;
        e._emscripten_bind_ResultIterator_SymbolIsSuperscript_0 = dd = c.Sa;
        e._emscripten_bind_ResultIterator_SymbolIsSubscript_0 = ed = c.Ta;
        e._emscripten_bind_ResultIterator_SymbolIsDropcap_0 = fd = c.Ua;
        e._emscripten_bind_ResultIterator___destroy___0 = gd = c.Va;
        e._emscripten_bind_TextlineOrder___destroy___0 = hd = c.Wa;
        e._emscripten_bind_ETEXT_DESC___destroy___0 = jd = c.Xa;
        e._emscripten_bind_PageIterator_Begin_0 = kd = c.Ya;
        e._emscripten_bind_PageIterator_RestartParagraph_0 = ld = c.Za;
        e._emscripten_bind_PageIterator_IsWithinFirstTextlineOfParagraph_0 = md = c._a;
        e._emscripten_bind_PageIterator_RestartRow_0 = nd = c.$a;
        e._emscripten_bind_PageIterator_Next_1 = od = c.ab;
        e._emscripten_bind_PageIterator_IsAtBeginningOf_1 = pd = c.bb;
        e._emscripten_bind_PageIterator_IsAtFinalElement_2 = qd = c.cb;
        e._emscripten_bind_PageIterator_Cmp_1 = rd = c.db;
        e._emscripten_bind_PageIterator_SetBoundingBoxComponents_2 = sd = c.eb;
        e._emscripten_bind_PageIterator_BoundingBox_5 = td = c.fb;
        e._emscripten_bind_PageIterator_BoundingBox_6 = ud = c.gb;
        e._emscripten_bind_PageIterator_BoundingBoxInternal_5 = vd = c.hb;
        e._emscripten_bind_PageIterator_Empty_1 = wd = c.ib;
        e._emscripten_bind_PageIterator_BlockType_0 = xd = c.jb;
        e._emscripten_bind_PageIterator_BlockPolygon_0 = yd = c.kb;
        e._emscripten_bind_PageIterator_GetBinaryImage_1 = zd = c.lb;
        e._emscripten_bind_PageIterator_GetImage_5 = Ad = c.mb;
        e._emscripten_bind_PageIterator_Baseline_5 = Bd = c.nb;
        e._emscripten_bind_PageIterator_Orientation_4 = Cd = c.ob;
        e._emscripten_bind_PageIterator_ParagraphInfo_4 = Dd = c.pb;
        e._emscripten_bind_PageIterator___destroy___0 = Ed = c.qb;
        e._emscripten_bind_WritingDirection___destroy___0 = Fd = c.rb;
        e._emscripten_bind_WordChoiceIterator_WordChoiceIterator_1 = Gd = c.sb;
        e._emscripten_bind_WordChoiceIterator_Next_0 = Hd = c.tb;
        e._emscripten_bind_WordChoiceIterator_GetUTF8Text_0 = Id = c.ub;
        e._emscripten_bind_WordChoiceIterator_Confidence_0 = Jd = c.vb;
        e._emscripten_bind_WordChoiceIterator___destroy___0 = Kd = c.wb;
        e._emscripten_bind_Box_get_x_0 = Ld = c.xb;
        e._emscripten_bind_Box_get_y_0 = Md = c.yb;
        e._emscripten_bind_Box_get_w_0 = Nd = c.zb;
        e._emscripten_bind_Box_get_h_0 = Od = c.Ab;
        e._emscripten_bind_Box_get_refcount_0 = Pd = c.Bb;
        e._emscripten_bind_Box___destroy___0 = Qd = c.Cb;
        e._emscripten_bind_TessPDFRenderer_TessPDFRenderer_3 = Rd = c.Db;
        e._emscripten_bind_TessPDFRenderer_BeginDocument_1 = Sd = c.Eb;
        e._emscripten_bind_TessPDFRenderer_AddImage_1 = Td = c.Fb;
        e._emscripten_bind_TessPDFRenderer_EndDocument_0 = Ud = c.Gb;
        e._emscripten_bind_TessPDFRenderer_happy_0 = Vd = c.Hb;
        e._emscripten_bind_TessPDFRenderer_file_extension_0 = Wd = c.Ib;
        e._emscripten_bind_TessPDFRenderer_title_0 = Xd = c.Jb;
        e._emscripten_bind_TessPDFRenderer_imagenum_0 = Yd = c.Kb;
        e._emscripten_bind_TessPDFRenderer___destroy___0 = Zd = c.Lb;
        e._emscripten_bind_PixaPtr___destroy___0 = $d = c.Mb;
        e._emscripten_bind_FloatPtr___destroy___0 = ae = c.Nb;
        e._emscripten_bind_ChoiceIterator_ChoiceIterator_1 = be = c.Ob;
        e._emscripten_bind_ChoiceIterator_Next_0 = ce = c.Pb;
        e._emscripten_bind_ChoiceIterator_GetUTF8Text_0 = de = c.Qb;
        e._emscripten_bind_ChoiceIterator_Confidence_0 = ee = c.Rb;
        e._emscripten_bind_ChoiceIterator___destroy___0 = fe = c.Sb;
        e._emscripten_bind_PixPtr___destroy___0 = ge = c.Tb;
        e._emscripten_bind_UNICHARSET_get_script_from_script_id_1 = he = c.Ub;
        e._emscripten_bind_UNICHARSET_get_script_id_from_name_1 = ie = c.Vb;
        e._emscripten_bind_UNICHARSET_get_script_table_size_0 = je = c.Wb;
        e._emscripten_bind_UNICHARSET___destroy___0 = ke = c.Xb;
        e._emscripten_bind_IntPtr___destroy___0 = le = c.Yb;
        e._emscripten_bind_Orientation___destroy___0 = me = c.Zb;
        e._emscripten_bind_OSBestResult_get_orientation_id_0 = ne = c._b;
        e._emscripten_bind_OSBestResult_get_script_id_0 = oe = c.$b;
        e._emscripten_bind_OSBestResult_get_sconfidence_0 = pe = c.ac;
        e._emscripten_bind_OSBestResult_get_oconfidence_0 = qe = c.bc;
        e._emscripten_bind_OSBestResult___destroy___0 = re = c.cc;
        e._emscripten_bind_Boxa_get_n_0 = se = c.dc;
        e._emscripten_bind_Boxa_get_nalloc_0 = te = c.ec;
        e._emscripten_bind_Boxa_get_refcount_0 = ue = c.fc;
        e._emscripten_bind_Boxa_get_box_0 = ve = c.gc;
        e._emscripten_bind_Boxa___destroy___0 = we = c.hc;
        e._emscripten_bind_PixColormap_get_array_0 = xe = c.ic;
        e._emscripten_bind_PixColormap_get_depth_0 = ye = c.jc;
        e._emscripten_bind_PixColormap_get_nalloc_0 = ze = c.kc;
        e._emscripten_bind_PixColormap_get_n_0 = Ae = c.lc;
        e._emscripten_bind_PixColormap___destroy___0 = Be = c.mc;
        e._emscripten_bind_Pta_get_n_0 = Ce = c.nc;
        e._emscripten_bind_Pta_get_nalloc_0 = De = c.oc;
        e._emscripten_bind_Pta_get_refcount_0 = Ee = c.pc;
        e._emscripten_bind_Pta_get_x_0 = Fe = c.qc;
        e._emscripten_bind_Pta_get_y_0 = Ge = c.rc;
        e._emscripten_bind_Pta___destroy___0 = He = c.sc;
        e._emscripten_bind_Pix_get_w_0 = Ie = c.tc;
        e._emscripten_bind_Pix_get_h_0 = Je = c.uc;
        e._emscripten_bind_Pix_get_d_0 = Ke = c.vc;
        e._emscripten_bind_Pix_get_spp_0 = Le = c.wc;
        e._emscripten_bind_Pix_get_wpl_0 = Me = c.xc;
        e._emscripten_bind_Pix_get_refcount_0 = Ne = c.yc;
        e._emscripten_bind_Pix_get_xres_0 = Oe = c.zc;
        e._emscripten_bind_Pix_get_yres_0 = Pe = c.Ac;
        e._emscripten_bind_Pix_get_informat_0 = Qe = c.Bc;
        e._emscripten_bind_Pix_get_special_0 = Re = c.Cc;
        e._emscripten_bind_Pix_get_text_0 = Se = c.Dc;
        e._emscripten_bind_Pix_get_colormap_0 = Te = c.Ec;
        e._emscripten_bind_Pix_get_data_0 = Ue = c.Fc;
        e._emscripten_bind_Pix___destroy___0 = Ve = c.Gc;
        e._emscripten_bind_DoublePtr___destroy___0 = We = c.Hc;
        e._emscripten_bind_Dawg___destroy___0 = Xe = c.Ic;
        e._emscripten_bind_BoxPtr___destroy___0 = Ye = c.Jc;
        e._emscripten_bind_TessBaseAPI_TessBaseAPI_0 = Ze = c.Kc;
        e._emscripten_bind_TessBaseAPI_Version_0 = $e = c.Lc;
        e._emscripten_bind_TessBaseAPI_SetInputName_1 = af = c.Mc;
        e._emscripten_bind_TessBaseAPI_GetInputName_0 = bf = c.Nc;
        e._emscripten_bind_TessBaseAPI_SetInputImage_1 = cf = c.Oc;
        e._emscripten_bind_TessBaseAPI_GetInputImage_0 = df = c.Pc;
        e._emscripten_bind_TessBaseAPI_GetSourceYResolution_0 = ef = c.Qc;
        e._emscripten_bind_TessBaseAPI_GetDatapath_0 = ff = c.Rc;
        e._emscripten_bind_TessBaseAPI_SetOutputName_1 = gf = c.Sc;
        e._emscripten_bind_TessBaseAPI_SetVariable_2 = hf = c.Tc;
        e._emscripten_bind_TessBaseAPI_SetDebugVariable_2 = jf = c.Uc;
        e._emscripten_bind_TessBaseAPI_GetIntVariable_2 = kf = c.Vc;
        e._emscripten_bind_TessBaseAPI_GetBoolVariable_2 = lf = c.Wc;
        e._emscripten_bind_TessBaseAPI_GetDoubleVariable_2 = mf = c.Xc;
        e._emscripten_bind_TessBaseAPI_GetStringVariable_1 = nf = c.Yc;
        e._emscripten_bind_TessBaseAPI_SaveParameters_1 = of = c.Zc;
        e._emscripten_bind_TessBaseAPI_RestoreParameters_1 = pf = c._c;
        e._emscripten_bind_TessBaseAPI_Init_2 = qf = c.$c;
        e._emscripten_bind_TessBaseAPI_Init_3 = rf = c.ad;
        e._emscripten_bind_TessBaseAPI_Init_4 = sf = c.bd;
        e._emscripten_bind_TessBaseAPI_GetInitLanguagesAsString_0 = tf = c.cd;
        e._emscripten_bind_TessBaseAPI_InitForAnalysePage_0 = uf = c.dd;
        e._emscripten_bind_TessBaseAPI_ReadConfigFile_1 = vf = c.ed;
        e._emscripten_bind_TessBaseAPI_ReadDebugConfigFile_1 = wf = c.fd;
        e._emscripten_bind_TessBaseAPI_SetPageSegMode_1 = xf = c.gd;
        e._emscripten_bind_TessBaseAPI_GetPageSegMode_0 = yf = c.hd;
        e._emscripten_bind_TessBaseAPI_TesseractRect_7 = zf = c.id;
        e._emscripten_bind_TessBaseAPI_ClearAdaptiveClassifier_0 = Af = c.jd;
        e._emscripten_bind_TessBaseAPI_SetImage_1 = Bf = c.kd;
        e._emscripten_bind_TessBaseAPI_SetImage_5 = Cf = c.ld;
        e._emscripten_bind_TessBaseAPI_SetImageFile_1 = Df = c.md;
        e._emscripten_bind_TessBaseAPI_SetSourceResolution_1 = Ef = c.nd;
        e._emscripten_bind_TessBaseAPI_SetRectangle_4 = Ff = c.od;
        e._emscripten_bind_TessBaseAPI_GetThresholdedImage_0 = Gf = c.pd;
        e._emscripten_bind_TessBaseAPI_WriteImage_0 = Hf = c.qd;
        e._emscripten_bind_TessBaseAPI_FindLines_0 = If = c.rd;
        e._emscripten_bind_TessBaseAPI_GetGradient_0 = Jf = c.sd;
        e._emscripten_bind_TessBaseAPI_GetRegions_1 = Kf = c.td;
        e._emscripten_bind_TessBaseAPI_GetTextlines_2 = Lf = c.ud;
        e._emscripten_bind_TessBaseAPI_GetTextlines_5 = Mf = c.vd;
        e._emscripten_bind_TessBaseAPI_GetStrips_2 = Nf = c.wd;
        e._emscripten_bind_TessBaseAPI_GetWords_1 = Of = c.xd;
        e._emscripten_bind_TessBaseAPI_GetConnectedComponents_1 = Pf = c.yd;
        e._emscripten_bind_TessBaseAPI_GetComponentImages_4 = Qf = c.zd;
        e._emscripten_bind_TessBaseAPI_GetComponentImages_7 = Rf = c.Ad;
        e._emscripten_bind_TessBaseAPI_GetThresholdedImageScaleFactor_0 = Sf = c.Bd;
        e._emscripten_bind_TessBaseAPI_AnalyseLayout_0 = Tf = c.Cd;
        e._emscripten_bind_TessBaseAPI_AnalyseLayout_1 = Uf = c.Dd;
        e._emscripten_bind_TessBaseAPI_Recognize_1 = Vf = c.Ed;
        e._emscripten_bind_TessBaseAPI_ProcessPages_4 = Wf = c.Fd;
        e._emscripten_bind_TessBaseAPI_ProcessPage_6 = Xf = c.Gd;
        e._emscripten_bind_TessBaseAPI_GetIterator_0 = Yf = c.Hd;
        e._emscripten_bind_TessBaseAPI_GetUTF8Text_0 = Zf = c.Id;
        e._emscripten_bind_TessBaseAPI_GetHOCRText_1 = $f = c.Jd;
        e._emscripten_bind_TessBaseAPI_GetJSONText_1 = ag = c.Kd;
        e._emscripten_bind_TessBaseAPI_GetTSVText_1 = bg = c.Ld;
        e._emscripten_bind_TessBaseAPI_GetBoxText_1 = cg = c.Md;
        e._emscripten_bind_TessBaseAPI_GetUNLVText_0 = dg = c.Nd;
        e._emscripten_bind_TessBaseAPI_GetOsdText_1 = eg = c.Od;
        e._emscripten_bind_TessBaseAPI_MeanTextConf_0 = fg = c.Pd;
        e._emscripten_bind_TessBaseAPI_AllWordConfidences_0 = gg = c.Qd;
        e._emscripten_bind_TessBaseAPI_Clear_0 = hg = c.Rd;
        e._emscripten_bind_TessBaseAPI_End_0 = ig = c.Sd;
        e._emscripten_bind_TessBaseAPI_ClearPersistentCache_0 = jg = c.Td;
        e._emscripten_bind_TessBaseAPI_IsValidWord_1 = kg = c.Ud;
        e._emscripten_bind_TessBaseAPI_IsValidCharacter_1 = lg = c.Vd;
        e._emscripten_bind_TessBaseAPI_DetectOS_1 = mg = c.Wd;
        e._emscripten_bind_TessBaseAPI_GetUnichar_1 = ng = c.Xd;
        e._emscripten_bind_TessBaseAPI_GetDawg_1 = og = c.Yd;
        e._emscripten_bind_TessBaseAPI_NumDawgs_0 = pg = c.Zd;
        e._emscripten_bind_TessBaseAPI_oem_0 = qg = c._d;
        e._emscripten_bind_TessBaseAPI___destroy___0 = rg = c.$d;
        e._emscripten_bind_OSResults_OSResults_0 = sg = c.ae;
        e._emscripten_bind_OSResults_print_scores_0 = tg = c.be;
        e._emscripten_bind_OSResults_get_best_result_0 = ug = c.ce;
        e._emscripten_bind_OSResults_get_unicharset_0 = vg = c.de;
        e._emscripten_bind_OSResults___destroy___0 = wg = c.ee;
        e._emscripten_bind_Pixa_get_n_0 = xg = c.fe;
        e._emscripten_bind_Pixa_get_nalloc_0 = yg = c.ge;
        e._emscripten_bind_Pixa_get_refcount_0 = zg = c.he;
        e._emscripten_bind_Pixa_get_pix_0 = Ag = c.ie;
        e._emscripten_bind_Pixa_get_boxa_0 = Bg = c.je;
        e._emscripten_bind_Pixa___destroy___0 = Cg = c.ke;
        e._emscripten_enum_PageIteratorLevel_RIL_BLOCK = Dg = c.le;
        e._emscripten_enum_PageIteratorLevel_RIL_PARA = Eg = c.me;
        e._emscripten_enum_PageIteratorLevel_RIL_TEXTLINE = Fg = c.ne;
        e._emscripten_enum_PageIteratorLevel_RIL_WORD = Gg = c.oe;
        e._emscripten_enum_PageIteratorLevel_RIL_SYMBOL = Hg = c.pe;
        e._emscripten_enum_OcrEngineMode_OEM_TESSERACT_ONLY = Ig = c.qe;
        e._emscripten_enum_OcrEngineMode_OEM_LSTM_ONLY = Jg = c.re;
        e._emscripten_enum_OcrEngineMode_OEM_TESSERACT_LSTM_COMBINED = Kg = c.se;
        e._emscripten_enum_OcrEngineMode_OEM_DEFAULT = Lg = c.te;
        e._emscripten_enum_OcrEngineMode_OEM_COUNT = Mg = c.ue;
        e._emscripten_enum_WritingDirection__WRITING_DIRECTION_LEFT_TO_RIGHT = Ng = c.ve;
        e._emscripten_enum_WritingDirection__WRITING_DIRECTION_RIGHT_TO_LEFT = Og = c.we;
        e._emscripten_enum_WritingDirection__WRITING_DIRECTION_TOP_TO_BOTTOM = Pg = c.xe;
        e._emscripten_enum_PolyBlockType_PT_UNKNOWN = Qg = c.ye;
        e._emscripten_enum_PolyBlockType_PT_FLOWING_TEXT = Rg = c.ze;
        e._emscripten_enum_PolyBlockType_PT_HEADING_TEXT = Sg = c.Ae;
        e._emscripten_enum_PolyBlockType_PT_PULLOUT_TEXT = Tg = c.Be;
        e._emscripten_enum_PolyBlockType_PT_EQUATION = Ug = c.Ce;
        e._emscripten_enum_PolyBlockType_PT_INLINE_EQUATION = Vg = c.De;
        e._emscripten_enum_PolyBlockType_PT_TABLE = Wg = c.Ee;
        e._emscripten_enum_PolyBlockType_PT_VERTICAL_TEXT = Xg = c.Fe;
        e._emscripten_enum_PolyBlockType_PT_CAPTION_TEXT = Yg = c.Ge;
        e._emscripten_enum_PolyBlockType_PT_FLOWING_IMAGE = Zg = c.He;
        e._emscripten_enum_PolyBlockType_PT_HEADING_IMAGE = $g = c.Ie;
        e._emscripten_enum_PolyBlockType_PT_PULLOUT_IMAGE = ah = c.Je;
        e._emscripten_enum_PolyBlockType_PT_HORZ_LINE = bh = c.Ke;
        e._emscripten_enum_PolyBlockType_PT_VERT_LINE = ch = c.Le;
        e._emscripten_enum_PolyBlockType_PT_NOISE = dh = c.Me;
        e._emscripten_enum_PolyBlockType_PT_COUNT = eh = c.Ne;
        e._emscripten_enum_StrongScriptDirection_DIR_NEUTRAL = fh = c.Oe;
        e._emscripten_enum_StrongScriptDirection_DIR_LEFT_TO_RIGHT = gh = c.Pe;
        e._emscripten_enum_StrongScriptDirection_DIR_RIGHT_TO_LEFT = hh = c.Qe;
        e._emscripten_enum_StrongScriptDirection_DIR_MIX = ih = c.Re;
        e._emscripten_enum_ParagraphJustification__JUSTIFICATION_UNKNOWN = jh = c.Se;
        e._emscripten_enum_ParagraphJustification__JUSTIFICATION_LEFT = kh = c.Te;
        e._emscripten_enum_ParagraphJustification__JUSTIFICATION_CENTER = lh = c.Ue;
        e._emscripten_enum_ParagraphJustification__JUSTIFICATION_RIGHT = mh = c.Ve;
        e._emscripten_enum_TextlineOrder__TEXTLINE_ORDER_LEFT_TO_RIGHT = nh = c.We;
        e._emscripten_enum_TextlineOrder__TEXTLINE_ORDER_RIGHT_TO_LEFT = oh = c.Xe;
        e._emscripten_enum_TextlineOrder__TEXTLINE_ORDER_TOP_TO_BOTTOM = ph = c.Ye;
        e._emscripten_enum_Orientation__ORIENTATION_PAGE_UP = qh = c.Ze;
        e._emscripten_enum_Orientation__ORIENTATION_PAGE_RIGHT = rh = c._e;
        e._emscripten_enum_Orientation__ORIENTATION_PAGE_DOWN = sh = c.$e;
        e._emscripten_enum_Orientation__ORIENTATION_PAGE_LEFT = th = c.af;
        e._emscripten_enum_PageSegMode_PSM_OSD_ONLY = uh = c.bf;
        e._emscripten_enum_PageSegMode_PSM_AUTO_OSD = vh = c.cf;
        e._emscripten_enum_PageSegMode_PSM_AUTO_ONLY = wh = c.df;
        e._emscripten_enum_PageSegMode_PSM_AUTO = xh = c.ef;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_COLUMN = yh = c.ff;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK_VERT_TEXT = zh = c.gf;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_BLOCK = Ah = c.hf;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_LINE = Bh = c.jf;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_WORD = Ch = c.kf;
        e._emscripten_enum_PageSegMode_PSM_CIRCLE_WORD = Dh = c.lf;
        e._emscripten_enum_PageSegMode_PSM_SINGLE_CHAR = Eh = c.mf;
        e._emscripten_enum_PageSegMode_PSM_SPARSE_TEXT = Fh = c.nf;
        e._emscripten_enum_PageSegMode_PSM_SPARSE_TEXT_OSD = Gh = c.of;
        e._emscripten_enum_PageSegMode_PSM_RAW_LINE = Hh = c.pf;
        e._emscripten_enum_PageSegMode_PSM_COUNT = Ih = c.qf;
        e._pixDestroy = c.rf;
        e._ptaDestroy = c.sf;
        e._boxaDestroy = c.tf;
        e._pixaDestroy = c.uf;
        e._pixReadMem = c.vf;
        e._free = Jh = c.wf;
        e._malloc = Kh = c.xf;
        e._pixReadHeaderMem = c.yf;
        lb = c.zf;
        Lh = c.Af;
        Mh = c.Bf;
        Nh = c.Cf;
        return ai;
      }
      var b = { a: Zh };
      if (e.instantiateWasm)
        return new Promise((c) => {
          e.instantiateWasm(b, (d, f) => {
            c(a(d, f));
          });
        });
      wa ??= new Uint8Array(e.wasmBinary);
      return a((await za(b)).instance);
    })();
    $h();
    function D() {}
    D.prototype = Object.create(D.prototype);
    D.prototype.constructor = D;
    D.prototype.If = D;
    D.Jf = {};
    e.WrapperObject = D;
    function bi(a) {
      return (a || D).Jf;
    }
    e.getCache = bi;
    function E(a, b) {
      var c = bi(b),
        d = c[a];
      if (d) return d;
      d = Object.create((b || D).prototype);
      d.Df = a;
      return (c[a] = d);
    }
    e.wrapPointer = E;
    e.castObject = function (a, b) {
      return E(a.Df, b);
    };
    e.NULL = E(0);
    e.destroy = function (a) {
      if (!a.__destroy__) throw "Error: Cannot destroy object. (Did you create it yourself?)";
      a.__destroy__();
      delete bi(a.If)[a.Df];
    };
    e.compare = function (a, b) {
      return a.Df === b.Df;
    };
    e.getPointer = function (a) {
      return a.Df;
    };
    e.getClass = function (a) {
      return a.If;
    };
    var ci = 0,
      di = 0,
      ei = 0,
      fi = [],
      gi = 0;
    function F() {
      if (gi) {
        for (var a = 0; a < fi.length; a++) e._free(fi[a]);
        fi.length = 0;
        e._free(ci);
        ci = 0;
        di += gi;
        gi = 0;
      }
      ci || ((di += 128), (ci = e._malloc(di)) || r());
      ei = 0;
    }
    function G(a) {
      if ("string" === typeof a) {
        a = eb(a);
        var b = g;
        ci || r();
        b = a.length * b.BYTES_PER_ELEMENT;
        b = (b + 7) & -8;
        if (ei + b >= di) {
          0 < b || r();
          gi += b;
          var c = e._malloc(b);
          fi.push(c);
        } else ((c = ci + ei), (ei += b));
        b = c;
        c = g;
        var d = b;
        switch (c.BYTES_PER_ELEMENT) {
          case 2:
            d >>= 1;
            break;
          case 4:
            d >>= 2;
            break;
          case 8:
            d >>= 3;
        }
        for (var f = 0; f < a.length; f++) c[d + f] = a[f];
        return b;
      }
      return a;
    }
    function hi() {
      throw "cannot construct a ParagraphJustification, no constructor in IDL";
    }
    hi.prototype = Object.create(D.prototype);
    hi.prototype.constructor = hi;
    hi.prototype.If = hi;
    hi.Jf = {};
    e.ParagraphJustification = hi;
    hi.prototype.__destroy__ = function () {
      gc(this.Df);
    };
    function ii() {
      throw "cannot construct a BoolPtr, no constructor in IDL";
    }
    ii.prototype = Object.create(D.prototype);
    ii.prototype.constructor = ii;
    ii.prototype.If = ii;
    ii.Jf = {};
    e.BoolPtr = ii;
    ii.prototype.__destroy__ = function () {
      hc(this.Df);
    };
    function H() {
      throw "cannot construct a TessResultRenderer, no constructor in IDL";
    }
    H.prototype = Object.create(D.prototype);
    H.prototype.constructor = H;
    H.prototype.If = H;
    H.Jf = {};
    e.TessResultRenderer = H;
    H.prototype.BeginDocument = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return !!ic(b, a);
    };
    H.prototype.AddImage = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!jc(b, a);
    };
    H.prototype.EndDocument = function () {
      return !!kc(this.Df);
    };
    H.prototype.happy = function () {
      return !!lc(this.Df);
    };
    H.prototype.file_extension = function () {
      return w(mc(this.Df));
    };
    H.prototype.title = H.prototype.title = function () {
      return w(nc(this.Df));
    };
    H.prototype.imagenum = function () {
      return oc(this.Df);
    };
    H.prototype.__destroy__ = function () {
      pc(this.Df);
    };
    function ji() {
      throw "cannot construct a LongStarPtr, no constructor in IDL";
    }
    ji.prototype = Object.create(D.prototype);
    ji.prototype.constructor = ji;
    ji.prototype.If = ji;
    ji.Jf = {};
    e.LongStarPtr = ji;
    ji.prototype.__destroy__ = function () {
      qc(this.Df);
    };
    function ki() {
      throw "cannot construct a VoidPtr, no constructor in IDL";
    }
    ki.prototype = Object.create(D.prototype);
    ki.prototype.constructor = ki;
    ki.prototype.If = ki;
    ki.Jf = {};
    e.VoidPtr = ki;
    ki.prototype.__destroy__ = function () {
      rc(this.Df);
    };
    function I(a) {
      a && "object" === typeof a && (a = a.Df);
      this.Df = sc(a);
      bi(I)[this.Df] = this;
    }
    I.prototype = Object.create(D.prototype);
    I.prototype.constructor = I;
    I.prototype.If = I;
    I.Jf = {};
    e.ResultIterator = I;
    I.prototype.Begin = function () {
      tc(this.Df);
    };
    I.prototype.RestartParagraph = function () {
      uc(this.Df);
    };
    I.prototype.IsWithinFirstTextlineOfParagraph = function () {
      return !!vc(this.Df);
    };
    I.prototype.RestartRow = function () {
      wc(this.Df);
    };
    I.prototype.Next = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!xc(b, a);
    };
    I.prototype.IsAtBeginningOf = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!yc(b, a);
    };
    I.prototype.IsAtFinalElement = function (a, b) {
      var c = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      return !!zc(c, a, b);
    };
    I.prototype.Cmp = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return Ac(b, a);
    };
    I.prototype.SetBoundingBoxComponents = function (a, b) {
      var c = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      Bc(c, a, b);
    };
    I.prototype.BoundingBox = function (a, b, c, d, f, h) {
      var k = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      return void 0 === h ? !!Cc(k, a, b, c, d, f) : !!Dc(k, a, b, c, d, f, h);
    };
    I.prototype.BoundingBoxInternal = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return !!Ec(h, a, b, c, d, f);
    };
    I.prototype.Empty = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!Fc(b, a);
    };
    I.prototype.BlockType = function () {
      return Gc(this.Df);
    };
    I.prototype.BlockPolygon = function () {
      return E(Hc(this.Df), J);
    };
    I.prototype.GetBinaryImage = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(Ic(b, a), L);
    };
    I.prototype.GetImage = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return E(Jc(h, a, b, c, d, f), L);
    };
    I.prototype.Baseline = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return !!Kc(h, a, b, c, d, f);
    };
    I.prototype.RowAttributes = function (a, b, c) {
      var d = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      return !!Lc(d, a, b, c);
    };
    I.prototype.Orientation = function (a, b, c, d) {
      var f = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      Mc(f, a, b, c, d);
    };
    I.prototype.ParagraphInfo = function (a, b, c, d) {
      var f = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      Nc(f, a, b, c, d);
    };
    I.prototype.ParagraphIsLtr = function () {
      return !!Oc(this.Df);
    };
    I.prototype.GetUTF8Text = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return w(Pc(b, a));
    };
    I.prototype.SetLineSeparator = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      Qc(b, a);
    };
    I.prototype.SetParagraphSeparator = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      Rc(b, a);
    };
    I.prototype.Confidence = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return Sc(b, a);
    };
    I.prototype.WordFontAttributes = function (a, b, c, d, f, h, k, m) {
      var u = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      k && "object" === typeof k && (k = k.Df);
      m && "object" === typeof m && (m = m.Df);
      return w(Tc(u, a, b, c, d, f, h, k, m));
    };
    I.prototype.WordRecognitionLanguage = function () {
      return w(Uc(this.Df));
    };
    I.prototype.WordDirection = function () {
      return Vc(this.Df);
    };
    I.prototype.WordIsFromDictionary = function () {
      return !!Wc(this.Df);
    };
    I.prototype.WordIsNumeric = function () {
      return !!Xc(this.Df);
    };
    I.prototype.HasBlamerInfo = function () {
      return !!Yc(this.Df);
    };
    I.prototype.HasTruthString = function () {
      return !!Zc(this.Df);
    };
    I.prototype.EquivalentToTruth = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return !!$c(b, a);
    };
    I.prototype.WordTruthUTF8Text = function () {
      return w(ad(this.Df));
    };
    I.prototype.WordNormedUTF8Text = function () {
      return w(bd(this.Df));
    };
    I.prototype.WordLattice = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return w(cd(b, a));
    };
    I.prototype.SymbolIsSuperscript = function () {
      return !!dd(this.Df);
    };
    I.prototype.SymbolIsSubscript = function () {
      return !!ed(this.Df);
    };
    I.prototype.SymbolIsDropcap = function () {
      return !!fd(this.Df);
    };
    I.prototype.__destroy__ = function () {
      gd(this.Df);
    };
    function li() {
      throw "cannot construct a TextlineOrder, no constructor in IDL";
    }
    li.prototype = Object.create(D.prototype);
    li.prototype.constructor = li;
    li.prototype.If = li;
    li.Jf = {};
    e.TextlineOrder = li;
    li.prototype.__destroy__ = function () {
      hd(this.Df);
    };
    function mi() {
      throw "cannot construct a ETEXT_DESC, no constructor in IDL";
    }
    mi.prototype = Object.create(D.prototype);
    mi.prototype.constructor = mi;
    mi.prototype.If = mi;
    mi.Jf = {};
    e.ETEXT_DESC = mi;
    mi.prototype.__destroy__ = function () {
      jd(this.Df);
    };
    function M() {
      throw "cannot construct a PageIterator, no constructor in IDL";
    }
    M.prototype = Object.create(D.prototype);
    M.prototype.constructor = M;
    M.prototype.If = M;
    M.Jf = {};
    e.PageIterator = M;
    M.prototype.Begin = function () {
      kd(this.Df);
    };
    M.prototype.RestartParagraph = function () {
      ld(this.Df);
    };
    M.prototype.IsWithinFirstTextlineOfParagraph = function () {
      return !!md(this.Df);
    };
    M.prototype.RestartRow = function () {
      nd(this.Df);
    };
    M.prototype.Next = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!od(b, a);
    };
    M.prototype.IsAtBeginningOf = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!pd(b, a);
    };
    M.prototype.IsAtFinalElement = function (a, b) {
      var c = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      return !!qd(c, a, b);
    };
    M.prototype.Cmp = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return rd(b, a);
    };
    M.prototype.SetBoundingBoxComponents = function (a, b) {
      var c = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      sd(c, a, b);
    };
    M.prototype.BoundingBox = function (a, b, c, d, f, h) {
      var k = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      return void 0 === h ? !!td(k, a, b, c, d, f) : !!ud(k, a, b, c, d, f, h);
    };
    M.prototype.BoundingBoxInternal = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return !!vd(h, a, b, c, d, f);
    };
    M.prototype.Empty = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!wd(b, a);
    };
    M.prototype.BlockType = function () {
      return xd(this.Df);
    };
    M.prototype.BlockPolygon = function () {
      return E(yd(this.Df), J);
    };
    M.prototype.GetBinaryImage = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(zd(b, a), L);
    };
    M.prototype.GetImage = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return E(Ad(h, a, b, c, d, f), L);
    };
    M.prototype.Baseline = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return !!Bd(h, a, b, c, d, f);
    };
    M.prototype.Orientation = function (a, b, c, d) {
      var f = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      Cd(f, a, b, c, d);
    };
    M.prototype.ParagraphInfo = function (a, b, c, d) {
      var f = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      Dd(f, a, b, c, d);
    };
    M.prototype.__destroy__ = function () {
      Ed(this.Df);
    };
    function oi() {
      throw "cannot construct a WritingDirection, no constructor in IDL";
    }
    oi.prototype = Object.create(D.prototype);
    oi.prototype.constructor = oi;
    oi.prototype.If = oi;
    oi.Jf = {};
    e.WritingDirection = oi;
    oi.prototype.__destroy__ = function () {
      Fd(this.Df);
    };
    function pi(a) {
      a && "object" === typeof a && (a = a.Df);
      this.Df = Gd(a);
      bi(pi)[this.Df] = this;
    }
    pi.prototype = Object.create(D.prototype);
    pi.prototype.constructor = pi;
    pi.prototype.If = pi;
    pi.Jf = {};
    e.WordChoiceIterator = pi;
    pi.prototype.Next = function () {
      return !!Hd(this.Df);
    };
    pi.prototype.GetUTF8Text = function () {
      return w(Id(this.Df));
    };
    pi.prototype.Confidence = function () {
      return Jd(this.Df);
    };
    pi.prototype.__destroy__ = function () {
      Kd(this.Df);
    };
    function N() {
      throw "cannot construct a Box, no constructor in IDL";
    }
    N.prototype = Object.create(D.prototype);
    N.prototype.constructor = N;
    N.prototype.If = N;
    N.Jf = {};
    e.Box = N;
    N.prototype.get_x = N.prototype.og = function () {
      return Ld(this.Df);
    };
    Object.defineProperty(N.prototype, "x", { get: N.prototype.og });
    N.prototype.get_y = N.prototype.pg = function () {
      return Md(this.Df);
    };
    Object.defineProperty(N.prototype, "y", { get: N.prototype.pg });
    N.prototype.get_w = N.prototype.ng = function () {
      return Nd(this.Df);
    };
    Object.defineProperty(N.prototype, "w", { get: N.prototype.ng });
    N.prototype.get_h = N.prototype.mg = function () {
      return Od(this.Df);
    };
    Object.defineProperty(N.prototype, "h", { get: N.prototype.mg });
    N.prototype.get_refcount = N.prototype.Vf = function () {
      return Pd(this.Df);
    };
    Object.defineProperty(N.prototype, "refcount", { get: N.prototype.Vf });
    N.prototype.__destroy__ = function () {
      Qd(this.Df);
    };
    function O(a, b, c) {
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b = b && "object" === typeof b ? b.Df : G(b);
      c && "object" === typeof c && (c = c.Df);
      this.Df = Rd(a, b, c);
      bi(O)[this.Df] = this;
    }
    O.prototype = Object.create(D.prototype);
    O.prototype.constructor = O;
    O.prototype.If = O;
    O.Jf = {};
    e.TessPDFRenderer = O;
    O.prototype.BeginDocument = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return !!Sd(b, a);
    };
    O.prototype.AddImage = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!Td(b, a);
    };
    O.prototype.EndDocument = function () {
      return !!Ud(this.Df);
    };
    O.prototype.happy = function () {
      return !!Vd(this.Df);
    };
    O.prototype.file_extension = function () {
      return w(Wd(this.Df));
    };
    O.prototype.title = O.prototype.title = function () {
      return w(Xd(this.Df));
    };
    O.prototype.imagenum = function () {
      return Yd(this.Df);
    };
    O.prototype.__destroy__ = function () {
      Zd(this.Df);
    };
    function qi() {
      throw "cannot construct a PixaPtr, no constructor in IDL";
    }
    qi.prototype = Object.create(D.prototype);
    qi.prototype.constructor = qi;
    qi.prototype.If = qi;
    qi.Jf = {};
    e.PixaPtr = qi;
    qi.prototype.__destroy__ = function () {
      $d(this.Df);
    };
    function ri() {
      throw "cannot construct a FloatPtr, no constructor in IDL";
    }
    ri.prototype = Object.create(D.prototype);
    ri.prototype.constructor = ri;
    ri.prototype.If = ri;
    ri.Jf = {};
    e.FloatPtr = ri;
    ri.prototype.__destroy__ = function () {
      ae(this.Df);
    };
    function si(a) {
      a && "object" === typeof a && (a = a.Df);
      this.Df = be(a);
      bi(si)[this.Df] = this;
    }
    si.prototype = Object.create(D.prototype);
    si.prototype.constructor = si;
    si.prototype.If = si;
    si.Jf = {};
    e.ChoiceIterator = si;
    si.prototype.Next = function () {
      return !!ce(this.Df);
    };
    si.prototype.GetUTF8Text = function () {
      return w(de(this.Df));
    };
    si.prototype.Confidence = function () {
      return ee(this.Df);
    };
    si.prototype.__destroy__ = function () {
      fe(this.Df);
    };
    function ti() {
      throw "cannot construct a PixPtr, no constructor in IDL";
    }
    ti.prototype = Object.create(D.prototype);
    ti.prototype.constructor = ti;
    ti.prototype.If = ti;
    ti.Jf = {};
    e.PixPtr = ti;
    ti.prototype.__destroy__ = function () {
      ge(this.Df);
    };
    function ui() {
      throw "cannot construct a UNICHARSET, no constructor in IDL";
    }
    ui.prototype = Object.create(D.prototype);
    ui.prototype.constructor = ui;
    ui.prototype.If = ui;
    ui.Jf = {};
    e.UNICHARSET = ui;
    ui.prototype.get_script_from_script_id = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return w(he(b, a));
    };
    ui.prototype.get_script_id_from_name = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return ie(b, a);
    };
    ui.prototype.get_script_table_size = function () {
      return je(this.Df);
    };
    ui.prototype.__destroy__ = function () {
      ke(this.Df);
    };
    function vi() {
      throw "cannot construct a IntPtr, no constructor in IDL";
    }
    vi.prototype = Object.create(D.prototype);
    vi.prototype.constructor = vi;
    vi.prototype.If = vi;
    vi.Jf = {};
    e.IntPtr = vi;
    vi.prototype.__destroy__ = function () {
      le(this.Df);
    };
    function wi() {
      throw "cannot construct a Orientation, no constructor in IDL";
    }
    wi.prototype = Object.create(D.prototype);
    wi.prototype.constructor = wi;
    wi.prototype.If = wi;
    wi.Jf = {};
    e.Orientation = wi;
    wi.prototype.__destroy__ = function () {
      me(this.Df);
    };
    function P() {
      throw "cannot construct a OSBestResult, no constructor in IDL";
    }
    P.prototype = Object.create(D.prototype);
    P.prototype.constructor = P;
    P.prototype.If = P;
    P.Jf = {};
    e.OSBestResult = P;
    P.prototype.get_orientation_id = P.prototype.eh = function () {
      return ne(this.Df);
    };
    Object.defineProperty(P.prototype, "orientation_id", { get: P.prototype.eh });
    P.prototype.get_script_id = P.prototype.hh = function () {
      return oe(this.Df);
    };
    Object.defineProperty(P.prototype, "script_id", { get: P.prototype.hh });
    P.prototype.get_sconfidence = P.prototype.gh = function () {
      return pe(this.Df);
    };
    Object.defineProperty(P.prototype, "sconfidence", { get: P.prototype.gh });
    P.prototype.get_oconfidence = P.prototype.dh = function () {
      return qe(this.Df);
    };
    Object.defineProperty(P.prototype, "oconfidence", { get: P.prototype.dh });
    P.prototype.__destroy__ = function () {
      re(this.Df);
    };
    function Q() {
      throw "cannot construct a Boxa, no constructor in IDL";
    }
    Q.prototype = Object.create(D.prototype);
    Q.prototype.constructor = Q;
    Q.prototype.If = Q;
    Q.Jf = {};
    e.Boxa = Q;
    Q.prototype.get_n = Q.prototype.Zf = function () {
      return se(this.Df);
    };
    Object.defineProperty(Q.prototype, "n", { get: Q.prototype.Zf });
    Q.prototype.get_nalloc = Q.prototype.$f = function () {
      return te(this.Df);
    };
    Object.defineProperty(Q.prototype, "nalloc", { get: Q.prototype.$f });
    Q.prototype.get_refcount = Q.prototype.Vf = function () {
      return ue(this.Df);
    };
    Object.defineProperty(Q.prototype, "refcount", { get: Q.prototype.Vf });
    Q.prototype.get_box = Q.prototype.Wg = function () {
      return E(ve(this.Df), xi);
    };
    Object.defineProperty(Q.prototype, "box", { get: Q.prototype.Wg });
    Q.prototype.__destroy__ = function () {
      we(this.Df);
    };
    function R() {
      throw "cannot construct a PixColormap, no constructor in IDL";
    }
    R.prototype = Object.create(D.prototype);
    R.prototype.constructor = R;
    R.prototype.If = R;
    R.Jf = {};
    e.PixColormap = R;
    R.prototype.get_array = R.prototype.Ug = function () {
      return xe(this.Df);
    };
    Object.defineProperty(R.prototype, "array", { get: R.prototype.Ug });
    R.prototype.get_depth = R.prototype.ah = function () {
      return ye(this.Df);
    };
    Object.defineProperty(R.prototype, "depth", { get: R.prototype.ah });
    R.prototype.get_nalloc = R.prototype.$f = function () {
      return ze(this.Df);
    };
    Object.defineProperty(R.prototype, "nalloc", { get: R.prototype.$f });
    R.prototype.get_n = R.prototype.Zf = function () {
      return Ae(this.Df);
    };
    Object.defineProperty(R.prototype, "n", { get: R.prototype.Zf });
    R.prototype.__destroy__ = function () {
      Be(this.Df);
    };
    function J() {
      throw "cannot construct a Pta, no constructor in IDL";
    }
    J.prototype = Object.create(D.prototype);
    J.prototype.constructor = J;
    J.prototype.If = J;
    J.Jf = {};
    e.Pta = J;
    J.prototype.get_n = J.prototype.Zf = function () {
      return Ce(this.Df);
    };
    Object.defineProperty(J.prototype, "n", { get: J.prototype.Zf });
    J.prototype.get_nalloc = J.prototype.$f = function () {
      return De(this.Df);
    };
    Object.defineProperty(J.prototype, "nalloc", { get: J.prototype.$f });
    J.prototype.get_refcount = J.prototype.Vf = function () {
      return Ee(this.Df);
    };
    Object.defineProperty(J.prototype, "refcount", { get: J.prototype.Vf });
    J.prototype.get_x = J.prototype.og = function () {
      return E(Fe(this.Df), ri);
    };
    Object.defineProperty(J.prototype, "x", { get: J.prototype.og });
    J.prototype.get_y = J.prototype.pg = function () {
      return E(Ge(this.Df), ri);
    };
    Object.defineProperty(J.prototype, "y", { get: J.prototype.pg });
    J.prototype.__destroy__ = function () {
      He(this.Df);
    };
    function L() {
      throw "cannot construct a Pix, no constructor in IDL";
    }
    L.prototype = Object.create(D.prototype);
    L.prototype.constructor = L;
    L.prototype.If = L;
    L.Jf = {};
    e.Pix = L;
    L.prototype.get_w = L.prototype.ng = function () {
      return Ie(this.Df);
    };
    Object.defineProperty(L.prototype, "w", { get: L.prototype.ng });
    L.prototype.get_h = L.prototype.mg = function () {
      return Je(this.Df);
    };
    Object.defineProperty(L.prototype, "h", { get: L.prototype.mg });
    L.prototype.get_d = L.prototype.Zg = function () {
      return Ke(this.Df);
    };
    Object.defineProperty(L.prototype, "d", { get: L.prototype.Zg });
    L.prototype.get_spp = L.prototype.jh = function () {
      return Le(this.Df);
    };
    Object.defineProperty(L.prototype, "spp", { get: L.prototype.jh });
    L.prototype.get_wpl = L.prototype.mh = function () {
      return Me(this.Df);
    };
    Object.defineProperty(L.prototype, "wpl", { get: L.prototype.mh });
    L.prototype.get_refcount = L.prototype.Vf = function () {
      return Ne(this.Df);
    };
    Object.defineProperty(L.prototype, "refcount", { get: L.prototype.Vf });
    L.prototype.get_xres = L.prototype.nh = function () {
      return Oe(this.Df);
    };
    Object.defineProperty(L.prototype, "xres", { get: L.prototype.nh });
    L.prototype.get_yres = L.prototype.oh = function () {
      return Pe(this.Df);
    };
    Object.defineProperty(L.prototype, "yres", { get: L.prototype.oh });
    L.prototype.get_informat = L.prototype.bh = function () {
      return Qe(this.Df);
    };
    Object.defineProperty(L.prototype, "informat", { get: L.prototype.bh });
    L.prototype.get_special = L.prototype.ih = function () {
      return Re(this.Df);
    };
    Object.defineProperty(L.prototype, "special", { get: L.prototype.ih });
    L.prototype.get_text = L.prototype.kh = function () {
      return w(Se(this.Df));
    };
    Object.defineProperty(L.prototype, "text", { get: L.prototype.kh });
    L.prototype.get_colormap = L.prototype.Yg = function () {
      return E(Te(this.Df), R);
    };
    Object.defineProperty(L.prototype, "colormap", { get: L.prototype.Yg });
    L.prototype.get_data = L.prototype.$g = function () {
      return Ue(this.Df);
    };
    Object.defineProperty(L.prototype, "data", { get: L.prototype.$g });
    L.prototype.__destroy__ = function () {
      Ve(this.Df);
    };
    function yi() {
      throw "cannot construct a DoublePtr, no constructor in IDL";
    }
    yi.prototype = Object.create(D.prototype);
    yi.prototype.constructor = yi;
    yi.prototype.If = yi;
    yi.Jf = {};
    e.DoublePtr = yi;
    yi.prototype.__destroy__ = function () {
      We(this.Df);
    };
    function zi() {
      throw "cannot construct a Dawg, no constructor in IDL";
    }
    zi.prototype = Object.create(D.prototype);
    zi.prototype.constructor = zi;
    zi.prototype.If = zi;
    zi.Jf = {};
    e.Dawg = zi;
    zi.prototype.__destroy__ = function () {
      Xe(this.Df);
    };
    function xi() {
      throw "cannot construct a BoxPtr, no constructor in IDL";
    }
    xi.prototype = Object.create(D.prototype);
    xi.prototype.constructor = xi;
    xi.prototype.If = xi;
    xi.Jf = {};
    e.BoxPtr = xi;
    xi.prototype.__destroy__ = function () {
      Ye(this.Df);
    };
    function S() {
      this.Df = Ze();
      bi(S)[this.Df] = this;
    }
    S.prototype = Object.create(D.prototype);
    S.prototype.constructor = S;
    S.prototype.If = S;
    S.Jf = {};
    e.TessBaseAPI = S;
    S.prototype.Version = function () {
      return w($e(this.Df));
    };
    S.prototype.SetInputName = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      af(b, a);
    };
    S.prototype.GetInputName = function () {
      return w(bf(this.Df));
    };
    S.prototype.SetInputImage = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      cf(b, a);
    };
    S.prototype.GetInputImage = function () {
      return E(df(this.Df), L);
    };
    S.prototype.GetSourceYResolution = function () {
      return ef(this.Df);
    };
    S.prototype.GetDatapath = function () {
      return w(ff(this.Df));
    };
    S.prototype.SetOutputName = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      gf(b, a);
    };
    S.prototype.SetVariable = S.prototype.SetVariable = function (a, b) {
      var c = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b = b && "object" === typeof b ? b.Df : G(b);
      return !!hf(c, a, b);
    };
    S.prototype.SetDebugVariable = function (a, b) {
      var c = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b = b && "object" === typeof b ? b.Df : G(b);
      return !!jf(c, a, b);
    };
    S.prototype.GetIntVariable = function (a, b) {
      var c = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b && "object" === typeof b && (b = b.Df);
      return !!kf(c, a, b);
    };
    S.prototype.GetBoolVariable = function (a, b) {
      var c = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b && "object" === typeof b && (b = b.Df);
      return !!lf(c, a, b);
    };
    S.prototype.GetDoubleVariable = function (a, b) {
      var c = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b && "object" === typeof b && (b = b.Df);
      return !!mf(c, a, b);
    };
    S.prototype.GetStringVariable = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return w(nf(b, a));
    };
    S.prototype.Init = function (a, b, c, d) {
      void 0 === c && void 0 !== d && (c = 3);
      var f = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b = b && "object" === typeof b ? b.Df : G(b);
      d = d && "object" === typeof d ? d.Df : G(d);
      c && "object" === typeof c && (c = c.Df);
      return void 0 === c && void 0 !== d
        ? sf(f, a, b, 3, d)
        : void 0 === c
          ? qf(f, a, b)
          : void 0 === d
            ? rf(f, a, b, c)
            : sf(f, a, b, c, d);
    };
    S.prototype.GetInitLanguagesAsString = function () {
      return w(tf(this.Df));
    };
    S.prototype.InitForAnalysePage = function () {
      uf(this.Df);
    };
    S.prototype.SaveParameters = function () {
      of(this.Df);
    };
    S.prototype.RestoreParameters = function () {
      pf(this.Df);
    };
    S.prototype.ReadConfigFile = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      vf(b, a);
    };
    S.prototype.ReadDebugConfigFile = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      wf(b, a);
    };
    S.prototype.SetPageSegMode = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      xf(b, a);
    };
    S.prototype.GetPageSegMode = function () {
      return yf(this.Df);
    };
    S.prototype.TesseractRect = function (a, b, c, d, f, h, k) {
      var m = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      k && "object" === typeof k && (k = k.Df);
      return w(zf(m, a, b, c, d, f, h, k));
    };
    S.prototype.ClearAdaptiveClassifier = function () {
      Af(this.Df);
    };
    S.prototype.SetImage = function (a, b, c, d, f, h = 1, k = 0) {
      var m = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      void 0 === b || null === b ? Bf(m, a, h, k) : Cf(m, a, b, c, d, f, h, k);
    };
    S.prototype.SetImageFile = function (a = 1, b = 0) {
      return Df(this.Df, a, b);
    };
    S.prototype.SetSourceResolution = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      Ef(b, a);
    };
    S.prototype.SetRectangle = function (a, b, c, d) {
      var f = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      Ff(f, a, b, c, d);
    };
    S.prototype.GetThresholdedImage = function () {
      return E(Gf(this.Df), L);
    };
    S.prototype.WriteImage = function (a) {
      Hf(this.Df, a);
    };
    S.prototype.GetRegions = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(Kf(b, a), Q);
    };
    S.prototype.GetTextlines = function (a, b, c, d, f) {
      var h = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      return void 0 === c
        ? E(Lf(h, a, b), Q)
        : void 0 === d
          ? E(_emscripten_bind_TessBaseAPI_GetTextlines_3(h, a, b, c), Q)
          : void 0 === f
            ? E(_emscripten_bind_TessBaseAPI_GetTextlines_4(h, a, b, c, d), Q)
            : E(Mf(h, a, b, c, d, f), Q);
    };
    S.prototype.GetStrips = function (a, b) {
      var c = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      return E(Nf(c, a, b), Q);
    };
    S.prototype.GetWords = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(Of(b, a), Q);
    };
    S.prototype.GetConnectedComponents = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(Pf(b, a), Q);
    };
    S.prototype.GetComponentImages = function (a, b, c, d, f, h, k) {
      var m = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      k && "object" === typeof k && (k = k.Df);
      return void 0 === f
        ? E(Qf(m, a, b, c, d), Q)
        : void 0 === h
          ? E(_emscripten_bind_TessBaseAPI_GetComponentImages_5(m, a, b, c, d, f), Q)
          : void 0 === k
            ? E(_emscripten_bind_TessBaseAPI_GetComponentImages_6(m, a, b, c, d, f, h), Q)
            : E(Rf(m, a, b, c, d, f, h, k), Q);
    };
    S.prototype.GetThresholdedImageScaleFactor = function () {
      return Sf(this.Df);
    };
    S.prototype.AnalyseLayout = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return void 0 === a ? E(Tf(b), M) : E(Uf(b, a), M);
    };
    S.prototype.Recognize = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return Vf(b, a);
    };
    S.prototype.FindLines = function () {
      return If(this.Df);
    };
    S.prototype.GetGradient = function () {
      return Jf(this.Df);
    };
    S.prototype.ProcessPages = function (a, b, c, d) {
      var f = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      b = b && "object" === typeof b ? b.Df : G(b);
      c && "object" === typeof c && (c = c.Df);
      d && "object" === typeof d && (d = d.Df);
      return !!Wf(f, a, b, c, d);
    };
    S.prototype.ProcessPage = function (a, b, c, d, f, h) {
      var k = this.Df;
      F();
      a && "object" === typeof a && (a = a.Df);
      b && "object" === typeof b && (b = b.Df);
      c = c && "object" === typeof c ? c.Df : G(c);
      d = d && "object" === typeof d ? d.Df : G(d);
      f && "object" === typeof f && (f = f.Df);
      h && "object" === typeof h && (h = h.Df);
      return !!Xf(k, a, b, c, d, f, h);
    };
    S.prototype.GetIterator = function () {
      return E(Yf(this.Df), I);
    };
    S.prototype.GetUTF8Text = function () {
      var a = Zf(this.Df),
        b = a ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetHOCRText = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b = (a = $f(b, a)) ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetTSVText = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b = (a = bg(b, a)) ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetJSONText = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b = (a = ag(b, a)) ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetBoxText = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b = (a = cg(b, a)) ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetUNLVText = function () {
      var a = dg(this.Df),
        b = a ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.GetOsdText = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      b = (a = eg(b, a)) ? v(l, a) : "";
      Jh(a);
      return b;
    };
    S.prototype.MeanTextConf = function () {
      return fg(this.Df);
    };
    S.prototype.AllWordConfidences = function () {
      return E(gg(this.Df), vi);
    };
    S.prototype.AdaptToWordStr = function (a, b) {
      var c = this.Df;
      F();
      a && "object" === typeof a && (a = a.Df);
      b = b && "object" === typeof b ? b.Df : G(b);
      return !!_emscripten_bind_TessBaseAPI_AdaptToWordStr_2(c, a, b);
    };
    S.prototype.Clear = function () {
      hg(this.Df);
    };
    S.prototype.End = function () {
      ig(this.Df);
    };
    S.prototype.ClearPersistentCache = function () {
      jg(this.Df);
    };
    S.prototype.IsValidWord = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return kg(b, a);
    };
    S.prototype.IsValidCharacter = function (a) {
      var b = this.Df;
      F();
      a = a && "object" === typeof a ? a.Df : G(a);
      return !!lg(b, a);
    };
    S.prototype.DetectOS = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return !!mg(b, a);
    };
    S.prototype.GetUnichar = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return w(ng(b, a));
    };
    S.prototype.GetDawg = function (a) {
      var b = this.Df;
      a && "object" === typeof a && (a = a.Df);
      return E(og(b, a), zi);
    };
    S.prototype.NumDawgs = function () {
      return pg(this.Df);
    };
    S.prototype.oem = function () {
      return qg(this.Df);
    };
    S.prototype.__destroy__ = function () {
      rg(this.Df);
    };
    function T() {
      this.Df = sg();
      bi(T)[this.Df] = this;
    }
    T.prototype = Object.create(D.prototype);
    T.prototype.constructor = T;
    T.prototype.If = T;
    T.Jf = {};
    e.OSResults = T;
    T.prototype.print_scores = function () {
      tg(this.Df);
    };
    T.prototype.get_best_result = T.prototype.Vg = function () {
      return E(ug(this.Df), P);
    };
    Object.defineProperty(T.prototype, "best_result", { get: T.prototype.Vg });
    T.prototype.get_unicharset = T.prototype.lh = function () {
      return E(vg(this.Df), ui);
    };
    Object.defineProperty(T.prototype, "unicharset", { get: T.prototype.lh });
    T.prototype.__destroy__ = function () {
      wg(this.Df);
    };
    function V() {
      throw "cannot construct a Pixa, no constructor in IDL";
    }
    V.prototype = Object.create(D.prototype);
    V.prototype.constructor = V;
    V.prototype.If = V;
    V.Jf = {};
    e.Pixa = V;
    V.prototype.get_n = V.prototype.Zf = function () {
      return xg(this.Df);
    };
    Object.defineProperty(V.prototype, "n", { get: V.prototype.Zf });
    V.prototype.get_nalloc = V.prototype.$f = function () {
      return yg(this.Df);
    };
    Object.defineProperty(V.prototype, "nalloc", { get: V.prototype.$f });
    V.prototype.get_refcount = V.prototype.Vf = function () {
      return zg(this.Df);
    };
    Object.defineProperty(V.prototype, "refcount", { get: V.prototype.Vf });
    V.prototype.get_pix = V.prototype.fh = function () {
      return E(Ag(this.Df), ti);
    };
    Object.defineProperty(V.prototype, "pix", { get: V.prototype.fh });
    V.prototype.get_boxa = V.prototype.Xg = function () {
      return E(Bg(this.Df), Q);
    };
    Object.defineProperty(V.prototype, "boxa", { get: V.prototype.Xg });
    V.prototype.__destroy__ = function () {
      Cg(this.Df);
    };
    (function () {
      function a() {
        e.RIL_BLOCK = Dg();
        e.RIL_PARA = Eg();
        e.RIL_TEXTLINE = Fg();
        e.RIL_WORD = Gg();
        e.RIL_SYMBOL = Hg();
        e.OEM_TESSERACT_ONLY = Ig();
        e.OEM_LSTM_ONLY = Jg();
        e.OEM_TESSERACT_LSTM_COMBINED = Kg();
        e.OEM_DEFAULT = Lg();
        e.OEM_COUNT = Mg();
        e.WRITING_DIRECTION_LEFT_TO_RIGHT = Ng();
        e.WRITING_DIRECTION_RIGHT_TO_LEFT = Og();
        e.WRITING_DIRECTION_TOP_TO_BOTTOM = Pg();
        e.PT_UNKNOWN = Qg();
        e.PT_FLOWING_TEXT = Rg();
        e.PT_HEADING_TEXT = Sg();
        e.PT_PULLOUT_TEXT = Tg();
        e.PT_EQUATION = Ug();
        e.PT_INLINE_EQUATION = Vg();
        e.PT_TABLE = Wg();
        e.PT_VERTICAL_TEXT = Xg();
        e.PT_CAPTION_TEXT = Yg();
        e.PT_FLOWING_IMAGE = Zg();
        e.PT_HEADING_IMAGE = $g();
        e.PT_PULLOUT_IMAGE = ah();
        e.PT_HORZ_LINE = bh();
        e.PT_VERT_LINE = ch();
        e.PT_NOISE = dh();
        e.PT_COUNT = eh();
        e.DIR_NEUTRAL = fh();
        e.DIR_LEFT_TO_RIGHT = gh();
        e.DIR_RIGHT_TO_LEFT = hh();
        e.DIR_MIX = ih();
        e.JUSTIFICATION_UNKNOWN = jh();
        e.JUSTIFICATION_LEFT = kh();
        e.JUSTIFICATION_CENTER = lh();
        e.JUSTIFICATION_RIGHT = mh();
        e.TEXTLINE_ORDER_LEFT_TO_RIGHT = nh();
        e.TEXTLINE_ORDER_RIGHT_TO_LEFT = oh();
        e.TEXTLINE_ORDER_TOP_TO_BOTTOM = ph();
        e.ORIENTATION_PAGE_UP = qh();
        e.ORIENTATION_PAGE_RIGHT = rh();
        e.ORIENTATION_PAGE_DOWN = sh();
        e.ORIENTATION_PAGE_LEFT = th();
        e.PSM_OSD_ONLY = uh();
        e.PSM_AUTO_OSD = vh();
        e.PSM_AUTO_ONLY = wh();
        e.PSM_AUTO = xh();
        e.PSM_SINGLE_COLUMN = yh();
        e.PSM_SINGLE_BLOCK_VERT_TEXT = zh();
        e.PSM_SINGLE_BLOCK = Ah();
        e.PSM_SINGLE_LINE = Bh();
        e.PSM_SINGLE_WORD = Ch();
        e.PSM_CIRCLE_WORD = Dh();
        e.PSM_SINGLE_CHAR = Eh();
        e.PSM_SPARSE_TEXT = Fh();
        e.PSM_SPARSE_TEXT_OSD = Gh();
        e.PSM_RAW_LINE = Hh();
        e.PSM_COUNT = Ih();
      }
      if (e.runtimeInitialized) a();
      else {
        var b = e.onRuntimeInitialized;
        e.onRuntimeInitialized = b
          ? function () {
              b.call(this);
              a();
            }
          : function () {
              a();
            };
      }
    })();
    ii.prototype.getValue = function (a) {
      return !!Ha(this.Df + (a || 0), "i8");
    };
    vi.prototype.getValue = function (a) {
      return Ha(this.Df + 4 * (a || 0), "i32");
    };
    ri.prototype.getValue = function (a) {
      return Ha(this.Df + 4 * (a || 0), "float");
    };
    yi.prototype.getValue = function (a) {
      return Ha(this.Df + 8 * (a || 0), "double");
    };
    xi.prototype.get =
      qi.prototype.get =
      ti.prototype.get =
        function (a) {
          return Ha(this.Df + 4 * (a || 0), "*");
        };
    function Ai() {
      this.dg = {};
    }
    Ai.prototype.wrap = function (a, b) {
      var c = Kh(4);
      Ja(c, 0, "i32");
      return (this.dg[a] = E(c, b));
    };
    Ai.prototype.bool = function (a) {
      return this.wrap(a, ii);
    };
    Ai.prototype.i32 = function (a) {
      return this.wrap(a, vi);
    };
    Ai.prototype.f32 = function (a) {
      return this.wrap(a, ri);
    };
    Ai.prototype.f64 = function (a) {
      return (this.dg[a] = E(Kh(8), yi));
    };
    Ai.prototype.peek = function () {
      var a = {},
        b;
      for (b in this.dg) a[b] = this.dg[b].getValue();
      return a;
    };
    Ai.prototype.get = function () {
      var a = {},
        b;
      for (b in this.dg) ((a[b] = this.dg[b].getValue()), Jh(this.dg[b].Df));
      return a;
    };
    I.prototype.getBoundingBox = function (a) {
      var b = new Ai();
      this.BoundingBox(a, b.i32("x0"), b.i32("y0"), b.i32("x1"), b.i32("y1"));
      return b.get();
    };
    I.prototype.getBaseline = function (a) {
      var b = new Ai();
      a = !!this.Baseline(a, b.i32("x0"), b.i32("y0"), b.i32("x1"), b.i32("y1"));
      b = b.get();
      b.has_baseline = a;
      return b;
    };
    I.prototype.getRowAttributes = function () {
      var a = new Ai();
      this.RowAttributes(a.f32("row_height"), a.f32("descenders"), a.f32("ascenders"));
      return a.get();
    };
    I.prototype.getWordFontAttributes = function () {
      var a = new Ai(),
        b = this.WordFontAttributes(
          a.bool("is_bold"),
          a.bool("is_italic"),
          a.bool("is_underlined"),
          a.bool("is_monospace"),
          a.bool("is_serif"),
          a.bool("is_smallcaps"),
          a.i32("pointsize"),
          a.i32("font_id"),
        );
      a = a.get();
      a.font_name = b;
      return a;
    };
    e.pointerHelper = Ai;
    ua
      ? (moduleRtn = e)
      : (moduleRtn = new Promise((a, b) => {
          na = a;
          oa = b;
        }));
    return moduleRtn;
  };
})();
if (typeof exports === "object" && typeof module === "object") {
  module.exports = TesseractCore;
  module.exports.default = TesseractCore;
} else if (typeof define === "function" && define["amd"]) define([], () => TesseractCore);
