/**
 * SubtleNotifications component.
 *
 * Site Kit by Google, Copyright 2024 Google LLC
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
import { Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useFeature } from '../../hooks/useFeature';
import AudienceSegmentationSetupSuccessSubtleNotification from '../../modules/analytics-4/components/audience-segmentation/dashboard/AudienceSegmentationSetupSuccessSubtleNotification';
import { RRMSetupSuccessSubtleNotification } from '../../modules/reader-revenue-manager/components/dashboard';
import useViewContext from '../../hooks/useViewContext';
import Notifications from './Notifications';
import { NOTIFICATION_AREAS } from '../../googlesitekit/notifications/datastore/constants';

export default function SubtleNotifications() {
	const viewContext = useViewContext();
	const audienceSegmentationEnabled = useFeature( 'audienceSegmentation' );
	const rrmModuleEnabled = useFeature( 'rrmModule' );

	// Each notification component rendered here has its own logic to determine
	// whether it should be displayed; in most cases none of these components
	// will be displayed, but it's also (currently) possible for multiple
	// notifications to be displayed if they each meet their criteria and haven't
	// been dismissed by the user.
	//
	// Because these notifications are subtle and small, this is acceptable UX.
	return (
		<Fragment>
			{ audienceSegmentationEnabled && (
				<AudienceSegmentationSetupSuccessSubtleNotification />
			) }
			{ rrmModuleEnabled && <RRMSetupSuccessSubtleNotification /> }
			<Notifications
				viewContext={ viewContext }
				areaSlug={ NOTIFICATION_AREAS.BANNERS_BELOW_NAV }
			/>
		</Fragment>
	);
}
