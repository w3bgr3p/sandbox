var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-oIxUN7/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// worker/index.js
var LOCK_ABI_KEY_EXPIRATION = "0x9d76ea58";
var LOCK_ABI_OWNER_OF = "0x6352211e";
var worker_default = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const rlKey = `rl:${ip}`;
    const hits = parseInt(await env.RATE_LIMIT.get(rlKey) || "0");
    if (hits >= 10) return json({ error: "too many requests" }, 429, corsHeaders);
    await env.RATE_LIMIT.put(rlKey, String(hits + 1), { expirationTtl: 60 });
    const url = new URL(request.url);
    if (url.pathname === "/api/check") {
      try {
        const authHeader = request.headers.get("Authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        if (!token) return json({ error: "no token" }, 401, corsHeaders);
        const payload = await verifyPrivyJwt(token, env.PRIVY_APP_ID);
        if (!payload) return json({ error: "invalid token" }, 401, corsHeaders);
        let address = url.searchParams.get("address") || "";
        if (!address && payload.sub) {
          return json({ error: "address required" }, 400, corsHeaders);
        }
        address = address.toLowerCase();
        if (!address.match(/^0x[0-9a-f]{40}$/)) {
          return json({ error: "invalid address" }, 400, corsHeaders);
        }
        const locks = env.LOCK_ADDRESS.split(",").map((a) => a.trim());
        let result = { valid: false };
        for (const lock of locks) {
          result = await checkUnlockAccess(address, lock, env.RPC_URL, parseInt(env.MAX_TOKEN_ID || "200"));
          if (result.valid) break;
        }
        return json(result, result.valid ? 200 : 403, corsHeaders);
      } catch (e) {
        return json({ error: e.message }, 500, corsHeaders);
      }
    }
    return json({ error: "not found" }, 404, corsHeaders);
  }
};
async function verifyPrivyJwt(token, appId) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("bad parts");
      return null;
    }
    const jwksRes = await fetch(`https://auth.privy.io/api/v1/apps/${appId}/jwks.json`);
    if (!jwksRes.ok) {
      console.log("jwks fetch failed", jwksRes.status);
      return null;
    }
    const { keys } = await jwksRes.json();
    const header = JSON.parse(atob(parts[0]));
    const jwk = keys.find((k) => k.kid === header.kid) || keys[0];
    if (!jwk) {
      console.log("no jwk found");
      return null;
    }
    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "ECDSA", namedCurve: "P-256" },
      false,
      ["verify"]
    );
    const data = new TextEncoder().encode(parts[0] + "." + parts[1]);
    const sig = base64urlDecode(parts[2]);
    const valid = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, key, sig, data);
    if (!valid) {
      console.log("bad signature");
      return null;
    }
    const payload = JSON.parse(atob(parts[1]));
    console.log("payload", JSON.stringify(payload));
    const now = Math.floor(Date.now() / 1e3);
    if (payload.exp && payload.exp < now) {
      console.log("expired");
      return null;
    }
    if (payload.iss !== "privy.io") {
      console.log("bad iss", payload.iss);
      return null;
    }
    if (payload.aud && payload.aud !== appId) {
      console.log("bad aud", payload.aud, appId);
      return null;
    }
    return payload;
  } catch (e) {
    console.log("verify error", e.message);
    return null;
  }
}
__name(verifyPrivyJwt, "verifyPrivyJwt");
async function checkUnlockAccess(address, lockAddress, rpcUrl, maxTokenId = 200) {
  console.log("checking", address, "on lock", lockAddress, "rpc", rpcUrl);
  const now = Math.floor(Date.now() / 1e3);
  for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
    try {
      const owner = await ethCall(rpcUrl, lockAddress, LOCK_ABI_OWNER_OF, tokenId);
      console.log("token", tokenId, "owner", owner);
      if (owner === "0x0000000000000000000000000000000000000000") break;
      if (owner.toLowerCase() !== address.toLowerCase()) continue;
      const expHex = await ethCallRaw(rpcUrl, lockAddress, LOCK_ABI_KEY_EXPIRATION, tokenId);
      const expiration = parseInt(expHex, 16);
      console.log("token", tokenId, "expiration", expiration, "now", Math.floor(Date.now() / 1e3));
      const valid = expiration === 0 || expiration > now;
      return {
        valid,
        tokenId,
        expiration,
        expiresAt: new Date(expiration * 1e3).toISOString(),
        address,
        lockAddress
      };
    } catch {
      break;
    }
  }
  return {
    valid: false,
    tokenId: null,
    expiration: 0,
    address,
    lockAddress
  };
}
__name(checkUnlockAccess, "checkUnlockAccess");
async function ethCall(rpcUrl, to, selector, tokenId) {
  const raw = await ethCallRaw(rpcUrl, to, selector, tokenId);
  return "0x" + raw.slice(-40);
}
__name(ethCall, "ethCall");
async function ethCallRaw(rpcUrl, to, selector, tokenId) {
  const param = tokenId.toString(16).padStart(64, "0");
  const data = selector + param;
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"]
    })
  });
  const { result, error } = await res.json();
  if (error) throw new Error(error.message);
  if (!result || result === "0x") throw new Error("empty result");
  return result.replace("0x", "");
}
__name(ethCallRaw, "ethCallRaw");
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}
__name(json, "json");
function base64urlDecode(str) {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    str.length + (4 - str.length % 4) % 4,
    "="
  );
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
__name(base64urlDecode, "base64urlDecode");

// C:/Users/l3gi0n/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/l3gi0n/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-oIxUN7/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/l3gi0n/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-oIxUN7/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
