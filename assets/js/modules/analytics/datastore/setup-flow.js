/**
 * `modules/analytics` data store: setup-flow.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import {
	MODULES_ANALYTICS,
	SETUP_FLOW_MODE_LEGACY,
	SETUP_FLOW_MODE_UA,
	SETUP_FLOW_MODE_GA4,
	SETUP_FLOW_MODE_GA4_TRANSITIONAL,
} from './constants';
import { MODULES_ANALYTICS_4 } from '../../analytics-4/datastore/constants';
import { isFeatureEnabled } from '../../../features';

const { createRegistrySelector } = Data;

const baseSelectors = {
	getSetupFlowMode: createRegistrySelector( ( select ) => () => {
		// The Google Analytics 4 is not enabled, so we have
		// to use the legacy implementation.
		if ( ! isFeatureEnabled( 'ga4setup' ) ) {
			return SETUP_FLOW_MODE_LEGACY;
		}

		// Check to see if the Admin API is working—if it's `false` we should
		// use the legacy analytics because the API isn't working properly.
		const isAdminAPIWorking = select( MODULES_ANALYTICS_4 ).isAdminAPIWorking();
		if ( isAdminAPIWorking === false ) {
			return SETUP_FLOW_MODE_LEGACY;
		}

		const hasGA4Properties = select( MODULES_ANALYTICS_4 ).hasProperties();
		if ( hasGA4Properties === undefined ) {
			return undefined;
		}

		// If there are no GA4 properties available for this account, don't use
		// GA4 and use the UA version.
		if ( hasGA4Properties === false ) {
			return SETUP_FLOW_MODE_UA;
		}

		const hasUAProperties = select( MODULES_ANALYTICS ).hasProperties();
		if ( hasUAProperties === undefined ) {
			return undefined;
		}

		// If no UA properties exist and there are GA4 properties, use GA4-only.
		if ( hasUAProperties === false ) {
			return SETUP_FLOW_MODE_GA4;
		}

		// There are UA and GA4 properties, so use the transitional mode.
		return SETUP_FLOW_MODE_GA4_TRANSITIONAL;
	} ),
};

const store = Data.combineStores(
	{
		selectors: baseSelectors,
	}
);

export const initialState = store.initialState;
export const actions = store.actions;
export const controls = store.controls;
export const reducer = store.reducer;
export const resolvers = store.resolvers;
export const selectors = store.selectors;

export default store;
