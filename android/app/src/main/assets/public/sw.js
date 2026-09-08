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
    "url": "pwa-512x512.svg",
    "revision": "0910b292d352a8ed2b619a190a4c4c06"
  }, {
    "url": "pwa-512x512.png",
    "revision": "3bbd5dc384386fc3ac64c9f89876ca48"
  }, {
    "url": "pwa-192x192.svg",
    "revision": "a096a8e4c0766eb3326f49539f12a058"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5c1b99d198fcd1ba58b2023d4fa7612d"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b96652049d119c284e83a58d69e65de1"
  }, {
    "url": "index.html",
    "revision": "ef5392df6916b5b95b4a28d8ad481444"
  }, {
    "url": "favicon.ico",
    "revision": "3f158cc720c1d428f16c6db50181f237"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "5ad67cd1369cfbfb05e797274df26e2f"
  }, {
    "url": "assets/workbox-window.prod.es5-BBnX5xw4.js",
    "revision": null
  }, {
    "url": "assets/web-D7mH4R_7.js",
    "revision": null
  }, {
    "url": "assets/web-Ce8EIBQH.js",
    "revision": null
  }, {
    "url": "assets/index-CznS5FdC.js",
    "revision": null
  }, {
    "url": "assets/index-BAOncOxL.css",
    "revision": null
  }, {
    "url": "assets/index-3eOgeQah.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "5ad67cd1369cfbfb05e797274df26e2f"
  }, {
    "url": "favicon.ico",
    "revision": "3f158cc720c1d428f16c6db50181f237"
  }, {
    "url": "manifest.webmanifest",
    "revision": "be23b353808f7d3e7815c34123d5e17d"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5c1b99d198fcd1ba58b2023d4fa7612d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "3bbd5dc384386fc3ac64c9f89876ca48"
  }, {
    "url": "manifest.webmanifest",
    "revision": "b96652049d119c284e83a58d69e65de1"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
