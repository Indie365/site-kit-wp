/**
 * modules/analytics data store: setup.
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
import Data from 'googlesitekit-data';
import { STORE_NAME } from '.';
import {
	isValidAccountID,
	isValidInternalWebPropertyID,
	isValidPropertySelection,
	isValidProfileSelection,
	isValidPropertyID,
} from '../util';
import { PROPERTY_CREATE, PROFILE_CREATE } from './constants';

const { createRegistrySelector, createRegistryControl } = Data;

// Actions
const SUBMIT_CHANGES_START = 'SUBMIT_CHANGES_START';
const SUBMIT_CHANGES_COMPLETED = 'SUBMIT_CHANGES_COMPLETED';
const SUBMIT_PROPERTY_CREATE = 'SUBMIT_PROPERTY_CREATE';
const SUBMIT_PROFILE_CREATE = 'SUBMIT_PROFILE_CREATE';
const SUBMIT_SAVE_SETTINGS = 'SUBMIT_SAVE_SETTINGS';
const SUBMIT_CHANGES_FAILED = 'SUBMIT_CHANGES_FAILED';

export const INITIAL_STATE = {
	isDoingSubmitChanges: false,
};

export const actions = {
	*submitChanges( onSuccess = () => {} ) {
		yield actions.startSubmitChanges();

		const registry = yield Data.commonActions.getRegistry();
		let propertyID = registry.select( STORE_NAME ).getPropertyID();

		if ( propertyID === PROPERTY_CREATE ) {
			const accountID = registry.select( STORE_NAME ).getAccountID();

			const { payload } = yield actions.submitPropertyCreate( accountID );
			const { property, error } = payload;

			if ( property ) {
				propertyID = property.id;
			} else if ( error ) {
				return actions.submitChangesFailed( { error } );
			}
		}

		const profileID = registry.select( STORE_NAME ).getProfileID();
		if ( profileID === PROFILE_CREATE ) {
			const accountID = registry.select( STORE_NAME ).getAccountID();

			const { payload } = yield actions.submitProfileCreate( accountID, propertyID );
			const { error } = payload;

			if ( error ) {
				return actions.submitChangesFailed( { error } );
			}
		}

		const { payload } = yield actions.submitSaveSettings();
		if ( payload.error ) {
			return actions.submitChangesFailed( { error: payload.error } );
		}

		onSuccess();

		return actions.finishSubmitChanges();
	},
	submitPropertyCreate( accountID ) {
		return {
			payload: { accountID },
			type: SUBMIT_PROPERTY_CREATE,
		};
	},
	submitProfileCreate( accountID, propertyID ) {
		return {
			payload: { accountID, propertyID },
			type: SUBMIT_PROFILE_CREATE,
		};
	},
	submitSaveSettings() {
		return { type: SUBMIT_SAVE_SETTINGS };
	},
	startSubmitChanges() {
		return { type: SUBMIT_CHANGES_START };
	},
	finishSubmitChanges() {
		return { type: SUBMIT_CHANGES_COMPLETED };
	},
	submitChangesFailed( { error } ) {
		return {
			payload: { error },
			type: SUBMIT_CHANGES_FAILED,
		};
	},
};

export const controls = {
	[ SUBMIT_PROPERTY_CREATE ]: createRegistryControl( ( registry ) => ( { payload } ) => {
		return registry.dispatch( STORE_NAME ).createProperty( payload.accountID );
	} ),
	[ SUBMIT_PROFILE_CREATE ]: createRegistryControl( ( registry ) => ( { payload } ) => {
		const { accountID, propertyID } = payload;
		return registry.dispatch( STORE_NAME ).createProfile( accountID, propertyID );
	} ),
	[ SUBMIT_SAVE_SETTINGS ]: createRegistryControl( ( registry ) => () => {
		return registry.dispatch( STORE_NAME ).saveSettings();
	} ),
};

export const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case SUBMIT_CHANGES_START: {
			return {
				...state,
				isDoingSubmitChanges: true,
			};
		}

		case SUBMIT_CHANGES_COMPLETED: {
			return {
				...state,
				isDoingSubmitChanges: false,
			};
		}

		case SUBMIT_CHANGES_FAILED: {
			return {
				...state,
				error: payload.error,
				isDoingSubmitChanges: false,
			};
		}

		default: return state;
	}
};

export const resolvers = {};

export const selectors = {
	/**
	 * Checks if changes can be submitted.
	 */
	canSubmitChanges: createRegistrySelector( ( select ) => () => {
		const {
			getAccountID,
			getInternalWebPropertyID,
			getProfileID,
			getPropertyID,
			hasExistingTag,
			hasTagPermission,
			haveSettingsChanged,
			isDoingSubmitChanges,
		} = select( STORE_NAME );

		switch ( true ) {
			case isDoingSubmitChanges() : return false;
			case ! haveSettingsChanged() : return false;
			case ! isValidAccountID( getAccountID() ) : return false;
			case ! isValidPropertySelection( getPropertyID() ) : return false;
			case ! isValidProfileSelection( getProfileID() ) : return false;
			// If the property ID is valid (non-create) the internal ID must be valid as well.
			case ( isValidPropertyID( getPropertyID() ) && ! isValidInternalWebPropertyID( getInternalWebPropertyID() ) ) : return false;
			// Do existing tag checks last.
			case ( hasExistingTag() && ! hasTagPermission( getPropertyID() ) ) : return false;
		}

		return true;
	} ),

	isDoingSubmitChanges( state ) {
		return !! state.isDoingSubmitChanges;
	},
};

export default {
	INITIAL_STATE,
	actions,
	controls,
	reducer,
	resolvers,
	selectors,
};

