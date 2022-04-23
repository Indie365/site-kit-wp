/**
 * ZeroDataStateNotifications component.
 *
 * Site Kit by Google, Copyright 2022 Google LLC
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
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_MODULES } from '../../../googlesitekit/modules/datastore/constants';
import { MODULES_ANALYTICS } from '../../../modules/analytics/datastore/constants';
import { MODULES_SEARCH_CONSOLE } from '../../../modules/search-console/datastore/constants';
import GatheringDataNotification from './GatheringDataNotification';
import ZeroDataNotification from './ZeroDataNotification';
const { useSelect, useInViewSelect } = Data;

export default function ZeroDataStateNotifications() {
	const isAnalyticsConnected = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleConnected( 'analytics' )
	);
	const analyticsGatheringData = useInViewSelect( ( select ) =>
		isAnalyticsConnected
			? select( MODULES_ANALYTICS ).isGatheringData()
			: false
	);
	const searchConsoleGatheringData = useInViewSelect( ( select ) =>
		select( MODULES_SEARCH_CONSOLE ).isGatheringData()
	);
	const analyticsHasZeroData = useInViewSelect( ( select ) =>
		isAnalyticsConnected ? select( MODULES_ANALYTICS ).hasZeroData() : false
	);
	const searchConsoleHasZeroData = useInViewSelect( ( select ) =>
		select( MODULES_SEARCH_CONSOLE ).hasZeroData()
	);

	// If any of the checks for gathering data or zero data states have
	// not finished loading, we don't show any notifications. This
	// prevents one notification from briefly showing while the other
	// notification loads and then replaces the first one.
	// See: https://github.com/google/site-kit-wp/issues/5008
	if (
		analyticsGatheringData === undefined ||
		searchConsoleGatheringData === undefined ||
		analyticsHasZeroData === undefined ||
		searchConsoleHasZeroData === undefined
	) {
		return null;
	}

	if (
		! analyticsGatheringData &&
		! searchConsoleGatheringData &&
		! analyticsHasZeroData &&
		! searchConsoleHasZeroData
	) {
		return null;
	}

	let gatheringDataTitle;
	if ( analyticsGatheringData && searchConsoleGatheringData ) {
		gatheringDataTitle = __(
			'Search Console and Analytics are gathering data',
			'google-site-kit'
		);
	} else if ( analyticsGatheringData ) {
		gatheringDataTitle = __(
			'Analytics is gathering data',
			'google-site-kit'
		);
	} else if ( searchConsoleGatheringData ) {
		gatheringDataTitle = __(
			'Search Console is gathering data',
			'google-site-kit'
		);
	}

	if ( analyticsGatheringData || searchConsoleGatheringData ) {
		return <GatheringDataNotification title={ gatheringDataTitle } />;
	}

	return <ZeroDataNotification />;
}
