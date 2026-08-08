/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "index.html",
    "revision": "2baa1f03a7a5be3ef3cb07e721b9916c"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/web-OvNKHURb.js",
    "revision": null
  }, {
    "url": "assets/web-BNTFXSGJ.js",
    "revision": null
  }, {
    "url": "assets/index-D_MlQo-S.js",
    "revision": null
  }, {
    "url": "assets/index-Cke1wVZr.js",
    "revision": null
  }, {
    "url": "assets/index-CXWMkAQk.css",
    "revision": null
  }, {
    "url": "assets/index-C2bq3x6M.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a18781bd5fbebddcb542ae21b044eb17"
  }, {
    "url": "favicon.png",
    "revision": "35d75a3c25224cfa82a72d25d7cedac0"
  }, {
    "url": "pwa-192x192.png",
    "revision": "3c8c476ab20ac58abc98efc002ffb789"
  }, {
    "url": "pwa-512x512.png",
    "revision": "8f2564b232887bd1dcbb6a27f016a70f"
  }, {
    "url": "manifest.webmanifest",
    "revision": "750c7f34f6ac4e8e81c1567a6f4e703d"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
