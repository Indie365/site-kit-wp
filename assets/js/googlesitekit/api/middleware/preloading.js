/**
 * Custom preloading middleware.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies.
 */
import { getStablePath } from '@wordpress/api-fetch/build/middlewares/preloading';
import { removeQueryArgs, getQueryArg } from '@wordpress/url';

/**
 * Creates a preloadingMiddleware instance with the given preloaded data.
 *
 * Based on preloadingMiddleware from @wordpress/api-fetch, this middleware is single-use per-endpoint and provides cached
 * data for the first request only and any subsequent requests hit the server.
 *
 * @since n.e.x.t
 *
 * @param {Object} preloadedData Preloaded data paths.
 * @return {Function} apiFetch middleware function.
 */
function createPreloadingMiddleware( preloadedData ) {
	const cache = Object.keys( preloadedData ).reduce( ( result, path ) => {
		result[ getStablePath( path ) ] = preloadedData[ path ];
		return result;
	}, {} );

	return ( options, next ) => {
		const { parse = true } = options;
		let uri = options.path;
		if ( typeof options.path === 'string' ) {
			const method = options.method?.toUpperCase() || 'GET';

			// If the path contains the timestamp param, we remove the cache and return the next() call.
			if ( getQueryArg( options.path, 'timestamp' ) ) {
				uri = removeQueryArgs( options.path, 'timestamp' );
				delete cache[ getStablePath( uri ) ];
				return next( options );
			}

			const path = getStablePath( uri );
			if ( parse && 'GET' === method && cache[ path ] ) {
				const result = Promise.resolve( cache[ path ].body );
				delete cache[ path ];
				return result;
			} else if (
				'OPTIONS' === method &&
				cache[ method ] &&
				cache[ method ][ path ]
			) {
				const result = Promise.resolve( cache[ method ][ path ] );
				delete cache[ method ][ path ];
				return result;
			}
		}
		return next( options );
	};
}
export default createPreloadingMiddleware;
