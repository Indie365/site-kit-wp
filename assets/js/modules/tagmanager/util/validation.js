/**
 * Validation utilities.
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
 * Internal dependencies
 */
import { ACCOUNT_CREATE, CONTAINER_CREATE, CONTEXT_WEB, CONTEXT_AMP } from '../datastore/constants';

/**
 * Checks the given value to see if it is a positive integer.
 *
 * @since n.e.x.t
 *
 * @param {*} input Value to check.
 * @return {boolean} Validity.
 */
const isValidNumericID = function( input ) {
	const id = parseInt( input, 10 ) || 0;

	return id > 0;
};

/**
 * Checks if the given account ID appears to be a valid Tag Manager account.
 *
 * @since n.e.x.t
 *
 * @param {(string|number)} accountID Account ID to test.
 * @return {boolean} Whether or not the given account ID is valid.
 */
export function isValidAccountID( accountID ) {
	return isValidNumericID( accountID );
}

/**
 * Checks if the given value is a valid selection for an Account.
 *
 * @since n.e.x.t
 *
 * @param {?string} value Selected value
 * @return {boolean} True if valid, otherwise false.
 */
export function isValidAccountSelection( value ) {
	if ( value === ACCOUNT_CREATE ) {
		return true;
	}

	return isValidAccountID( value );
}

/**
 * Checks if the given container ID appears to be a valid GTM container.
 *
 * @since n.e.x.t
 *
 * @param {string} containerID Container ID to check.
 * @return {boolean} Whether or not the given container ID is valid.
 */
export function isValidContainerID( containerID ) {
	return !! containerID?.toString?.()?.match?.( /^GTM-[A-Z0-9]+$/ );
}

/**
 * Checks if the given value is a valid selection for a container.
 *
 * @since n.e.x.t
 *
 * @param {?string} value Selected value
 * @return {boolean} True if valid, otherwise false.
 */
export function isValidContainerSelection( value ) {
	if ( value === CONTAINER_CREATE ) {
		return true;
	}

	return isValidContainerID( value );
}

/**
 * Checks if the given internal container ID appears to be valid.
 *
 * @since n.e.x.t
 *
 * @param {(string|number)} internalContainerID Internal container ID to test.
 * @return {boolean} Whether or not the given ID is valid.
 */
export function isValidInternalContainerID( internalContainerID ) {
	return isValidNumericID( internalContainerID );
}

/**
 * Checks if the given context is a valid container usage context.
 *
 * @since n.e.x.t
 *
 * @param {string} context A usage context to check.
 * @return {boolean} Whether or not the given context is valid.
 */
export function isValidUsageContext( context ) {
	return [ CONTEXT_WEB, CONTEXT_AMP ].includes( context );
}
