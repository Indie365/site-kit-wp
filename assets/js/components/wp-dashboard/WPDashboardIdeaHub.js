/**
 * Idea Hub notice component.
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
 * External dependencies
 */
import { useInView } from 'react-intersection-observer';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { useFeature } from '../../hooks/useFeature';
import { CORE_MODULES } from '../../googlesitekit/modules/datastore/constants';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import {
	MODULES_IDEA_HUB,
	IDEA_HUB_GA_CATEGORY_WPDASHBOARD,
} from '../../modules/idea-hub/datastore/constants';
import { trackEvent } from '../../util';
import GoogleLogoIcon from '../../../svg/logo-g.svg';
import Link from '../Link';

const { useSelect } = Data;

function WPDashboardIdeaHub() {
	const isIdeaHubEnabled = useFeature( 'ideaHubModule' );

	const { hasSavedIdeas, isModuleActive, dashboardURL } = useSelect(
		( select ) => {
			if ( ! isIdeaHubEnabled ) {
				return {};
			}

			const isActive = select( CORE_MODULES ).isModuleActive(
				'idea-hub'
			);
			if ( ! isActive ) {
				return {};
			}

			const savedIdeas = select( MODULES_IDEA_HUB ).getSavedIdeas();
			const adminURL = select( CORE_SITE ).getAdminURL(
				'googlesitekit-dashboard'
			);

			return {
				isModuleActive: isActive,
				hasSavedIdeas: savedIdeas?.length > 0,
				dashboardURL: `${ adminURL }#saved-ideas`,
			};
		}
	);

	const [ trackingRef, inView ] = useInView( {
		triggerOnce: true,
		threshold: 0.25,
	} );

	useEffect( () => {
		if ( inView ) {
			trackEvent( IDEA_HUB_GA_CATEGORY_WPDASHBOARD, 'view_notification' );
		}
	}, [ inView ] );

	const onClick = useCallback( async () => {
		await trackEvent(
			IDEA_HUB_GA_CATEGORY_WPDASHBOARD,
			'confirm_notification'
		);
	}, [] );

	if ( ! isModuleActive || ! hasSavedIdeas ) {
		return null;
	}

	return (
		<div
			className="googlesitekit-idea-hub__wpdashboard--notice"
			ref={ trackingRef }
		>
			<div className="googlesitekit-idea-hub__wpdashboard--header">
				<GoogleLogoIcon width="16" height="16" />
			</div>

			<div className="googlesitekit-idea-hub__wpdashboard--copy">
				{ __(
					'Want some inspiration for a new post?',
					'google-site-kit'
				) }
			</div>

			<div className="googlesitekit-idea-hub__wpdashboard--link">
				<Link href={ dashboardURL } onClick={ onClick }>
					{ __( 'View Ideas', 'google-site-kit' ) }
				</Link>
			</div>
		</div>
	);
}

export default WPDashboardIdeaHub;
