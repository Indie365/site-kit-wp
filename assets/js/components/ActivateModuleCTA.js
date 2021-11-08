/**
 * ActivateModule component.
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
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';
import { sprintf, __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_SITE } from '../googlesitekit/datastore/site/constants';
import {
	CORE_USER,
	PERMISSION_MANAGE_OPTIONS,
} from '../googlesitekit/datastore/user/constants';
import { CORE_MODULES } from '../googlesitekit/modules/datastore/constants';
import { CORE_LOCATION } from '../googlesitekit/datastore/location/constants';
import { VIEW_CONTEXT_DASHBOARD } from '../googlesitekit/constants';
import { trackEvent } from '../util';
import CTA from './notifications/CTA';
const { useSelect, useDispatch } = Data;

export default function ActivateModuleCTA( props ) {
	const { moduleSlug, title, description } = props;

	const module = useSelect( ( select ) =>
		select( CORE_MODULES ).getModule( moduleSlug )
	);
	const canManageOptions = useSelect( ( select ) =>
		select( CORE_USER ).hasCapability( PERMISSION_MANAGE_OPTIONS )
	);

	const { activateModule } = useDispatch( CORE_MODULES );
	const { navigateTo } = useDispatch( CORE_LOCATION );
	const { setInternalServerError } = useDispatch( CORE_SITE );

	const onCTAClick = useCallback( async () => {
		const { error, response } = await activateModule( moduleSlug );

		if ( ! error ) {
			await trackEvent(
				`${ VIEW_CONTEXT_DASHBOARD }_widget-activation-cta`,
				'activate_module',
				moduleSlug
			);

			navigateTo( response.moduleReauthURL );
		} else {
			setInternalServerError( {
				id: `${ moduleSlug }-setup-error`,
				description: error.message,
			} );
		}
	}, [ activateModule, moduleSlug, navigateTo, setInternalServerError ] );

	if ( ! module?.name || ! canManageOptions ) {
		return null;
	}

	let moduleTitle = title;
	let moduleDescription = description;

	// Special-cases for default title and description.
	// TODO: Solve these in a more appropriate way, e.g. by updating module registration data.
	switch ( moduleSlug ) {
		case 'analytics':
			if ( ! title ) {
				moduleTitle = __(
					'Learn more about what visitors do on your site',
					'google-site-kit'
				);
			}
			if ( ! description ) {
				moduleDescription = __(
					'Connect with Google Analytics to see unique visitors, goal completions, top pages and more',
					'google-site-kit'
				);
			}
			break;
		case 'pagespeed-insights':
			if ( ! description ) {
				moduleDescription = __(
					'Google PageSpeed Insights gives you metrics about performance, accessibility, SEO and PWA',
					'google-site-kit'
				);
			}
			break;
	}

	return (
		<CTA
			title={
				moduleTitle ||
				sprintf(
					/* translators: %s: Module name */
					__( 'Activate %s', 'google-site-kit' ),
					module.name
				)
			}
			description={
				moduleDescription ||
				sprintf(
					/* translators: %s: Module name */
					__( '%s module needs to be configured', 'google-site-kit' ),
					module.name
				)
			}
			ctaLabel={ sprintf(
				/* translators: %s: Module name */
				__( 'Set up %s', 'google-site-kit' ),
				module.name
			) }
			onClick={ onCTAClick }
		/>
	);
}

ActivateModuleCTA.propTypes = {
	moduleSlug: PropTypes.string.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
};
