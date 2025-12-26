/*
 * Bilibili VIP Modifier for Multiple APIs
 * For Quantumult X
 * Supports:
 * - https://api.bilibili.com/x/player/wbi/v2 (Player API)
 * - https://api.bilibili.com/x/space/wbi/acc/info (User Space API)
 * 
 * [rewrite_local]
 * ^https?:\/\/api\.bilibili\.com\/x\/(player|space)\/wbi\/(v2|acc\/info) url script-response-body https://raw.githubusercontent.com/yangwudong/Quantumult-X/refs/heads/main/SS/scripts/bilibiliDesktop.js

 * 
 * [mitm]
 * hostname = api.bilibili.com
 */

const $ = new Env('B站');

const url = $request.url;
let obj = JSON.parse($response.body);

try {
  // Handle web-interface/nav - Critical for VIP verification
  if (/\/x\/web-interface\/nav/.test(url)) {
    if (obj.data) {
      obj.data.vip_type = 2;
      obj.data.vipStatus = 1;
      obj.data.vipDueDate = 1892946300000;
      if (obj.data.vip) {
        modifyVipStatus(obj.data.vip);
      } else {
        obj.data.vip = createVipObject();
      }
      $.msg($.name, ``, "Bilibili web navigation VIP modified");
    }
  }
  
  // Handle playurl API - Unlock video quality & Remove AV1
  if (/\/player\/wbi\/playurl/.test(url)) {
    if (obj.data) {
      // 1. Unlock support_formats
      if (obj.data.support_formats) {
        obj.data.support_formats.forEach(format => {
          format.limit_watch_reason = 0;
          format.can_watch_qn_reason = 0;
        });
      }
      
      // 2. Make sure high quality is included in accept_quality
      if (obj.data.accept_quality) {
        const highQualities = [127, 120, 116, 112];
        highQualities.forEach(q => {
          if (!obj.data.accept_quality.includes(q)) {
            obj.data.accept_quality.unshift(q);
          }
        });
      }
      
      // 3. Update accept_description
      if (obj.data.accept_description && obj.data.accept_quality) {
        const qualityDescMap = {
          127: "8K 超高清",
          126: "杜比视界", 
          125: "HDR 真彩",
          120: "4K 超清",
          116: "1080P 60帧",
          112: "1080P 高码率",
          80: "1080P 高清",
          64: "720P 高清",
          32: "480P 清晰",
          16: "360P 流畅"
        };
        obj.data.accept_description = obj.data.accept_quality.map(q => 
          qualityDescMap[q] || `${q}P`
        );
      }

      // 4. [FIX] Remove AV1 Streams from DASH response
      // This prevents the player from selecting the AV1 codec which causes switching failures
      if (obj.data.dash && obj.data.dash.video) {
        const originalCount = obj.data.dash.video.length;
        obj.data.dash.video = obj.data.dash.video.filter(v => {
          // Filter out streams where codec is AV1 (codecid 13 or codec string contains av01)
          const isAV1 = (v.codecid === 13) || (v.codecs && v.codecs.includes('av01'));
          return !isAV1;
        });
        
        // Log if we removed anything
        if (obj.data.dash.video.length < originalCount) {
           console.log(`[Bilibili] Removed ${originalCount - obj.data.dash.video.length} AV1 stream(s) to fix playback.`);
        }
      }
      
      $.msg($.name, ``, "Bilibili playurl quality unlocked (AV1 Removed)");
    }
  }
  
  // Handle player/v2 API
  if (/\/player\/wbi\/v2/.test(url) && obj.data) {
    if (obj.data.support_formats) {
      obj.data.support_formats.forEach(format => {
        format.limit_watch_reason = 0;
        format.can_watch_qn_reason = 0;
      });
    }
    if (obj.data.vip) {
      modifyVipStatus(obj.data.vip);
    }
    $.msg($.name, ``, "Bilibili player v2 modified");
  }
  
  // Handle space/acc/info API
  if (/\/space\/wbi\/acc\/info/.test(url) && obj.data && obj.data.vip) {
    modifyVipStatus(obj.data.vip);
    $.msg($.name, ``, "Bilibili space info VIP modified");
  }
  
} catch (err) {
  $.msg($.name, ``, "Error modifying Bilibili response: " + err);
}

// Function to create VIP object
function createVipObject() {
  return {
    type: 2, status: 1, vip_pay_type: 1, due_date: 1892946300000, theme_type: 0,
    label: { text: "年度大会员", label_theme: "annual_vip", text_color: "#FFD700", bg_style: 1, bg_color: "#FB7299", use_img_label: true, img_label_uri_hans_static: "https://i0.hdslb.com/bfs/vip/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png" },
    avatar_subscript: 1, nickname_color: "#FB7299", role: 3, tv_vip_status: 0, tv_vip_pay_type: 0,
    ott_info: { vip_type: 1, pay_type: 1, status: 1, overdue_time: 1892946300000 },
    super_vip: { is_super_vip: true }
  };
}

// Function to modify VIP status
function modifyVipStatus(vip) {
  vip.type = 2; vip.status = 1; vip.vip_pay_type = 1; vip.due_date = 1892946300000;
  if (vip.label) {
    vip.label.text = "年度大会员"; vip.label.label_theme = "annual_vip"; vip.label.text_color = "#FFD700"; vip.label.bg_style = 1; vip.label.bg_color = "#FB7299"; vip.label.use_img_label = true;
    vip.label.img_label_uri_hans_static = "https://i0.hdslb.com/bfs/vip/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png";
  }
  vip.avatar_subscript = 1; vip.nickname_color = "#FB7299"; vip.role = 3;
  if (!vip.ott_info) vip.ott_info = {};
  vip.ott_info.vip_type = 1; vip.ott_info.pay_type = 1; vip.ott_info.status = 1; vip.ott_info.overdue_time = 1892946300000;
  if (!vip.super_vip) vip.super_vip = {};
  vip.super_vip.is_super_vip = true;
}

$done({ body: JSON.stringify(obj) });


// prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.encoding = "utf-8", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } isShadowrocket() { return "undefined" != typeof $rocket } isStash() { return "undefined" != typeof $environment && $environment["stash-version"] } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, a] = i.split("@"), n = { url: `http://${a}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), a = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(a); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { if (t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let s = require("iconv-lite"); this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: i, statusCode: r, headers: o, rawBody: a } = t, n = s.decode(a, this.encoding); e(null, { status: i, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: i, response: r } = t; e(i, r, r && s.decode(r.rawBody, this.encoding)) }) } } post(t, e = (() => { })) { const s = t.method ? t.method.toLocaleLowerCase() : "post"; if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient[s](t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status ? s.status : s.statusCode, s.status = s.statusCode), e(t, s, i) }); else if (this.isQuanX()) t.method = s, this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t && t.error || "UndefinedError")); else if (this.isNode()) { let i = require("iconv-lite"); this.initGotEnv(t); const { url: r, ...o } = t; this.got[s](r, o).then(t => { const { statusCode: s, statusCode: r, headers: o, rawBody: a } = t, n = i.decode(a, this.encoding); e(null, { status: s, statusCode: r, headers: o, rawBody: a, body: n }, n) }, t => { const { message: s, response: r } = t; e(s, r, r && i.decode(r.rawBody, this.encoding)) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl, i = t["update-pasteboard"] || t.updatePasteboard; return { "open-url": e, "media-url": s, "update-pasteboard": i } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), this.isSurge() || this.isQuanX() || this.isLoon() ? $done(t) : this.isNode() && process.exit(1) } }(t, e) }