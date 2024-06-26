// Copyright (c) 2024 anabrid GmbH
// Contact: https://www.anabrid.com/licensing/
// SPDX-License-Identifier: MIT OR GPL-2.0-or-later

/**
 * @file
 * This file describes default configuration options for the app.
 * They are "kind-of" build time constants but as they are JSON-serialized
 * in index.html, they can also be amended after build.
 * 
 * The values are first defined in vite.config.js, then JSON-serialized in index.html
 * as window.luci_globals and "renamed" here for abstracted and clean usage.
 **/

/**
 * Global constants are basically a map from string->string, in order to make
 * it simple to change them.
 */
export interface GlobalConstants {
    app_version: string,
    app_githash: string,
    app_build_date: string,

    /** Used for instance in <title> elements */
    app_name: string,

    /**
     * A list of URLs where this webapp is hosted. Useful to point the user to other
     * instances in case of problems, in particular to HTTP-only instances.
     * The strings shall encode URLs such as "http://foo/bar"
     **/
    canonical_urls?: string[],
  
    /**
     * suitable endpoint URLs are either explicit, such as "http://192.168.1.123/api"
     * or using loopback magic such as "http://127.0.0.1:1234/api"
     * or are relative to where the SPA is hosted from, i.e. "/api"
     **/
    endpoint?: string,
  
    /**
     * Data source name for Sentry performance monitor.
     * If not given, senitry is isabled
     */
    sentry_dsn?: string
}

export const derived = (defaults: GlobalConstants) => ({
    has_default_endpoint: Boolean(defaults.endpoint),

    /** Fully qualified application name including version */
    app_name_and_version: `${defaults.app_name}/${defaults.app_version}+${defaults.app_githash}`,

    /**
     * Endpoint URL as String.
     * This resolves also relative endpoints such as "/foo" to an absolute one.
     * This also, for convenience, replaces http:// and https:// endpoints with their
     * equivalent ws:// and wss:// ones.
     */
    endpoint_url: (()=>{ try {
        if(defaults.endpoint) {
            const candidate = new URL(defaults.endpoint, document.location.toString())
            if(/^https?/.test(candidate.protocol)) candidate.protocol = candidate.protocol.replace("http", "ws")
            return candidate
        }
    } catch(e) {}})()
})

export type ProgramConstants = GlobalConstants & ReturnType<typeof derived>

export const enrich = (defaults: GlobalConstants) : ProgramConstants => ({...defaults, ...derived(defaults)})

