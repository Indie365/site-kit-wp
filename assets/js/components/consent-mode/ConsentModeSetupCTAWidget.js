/**
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	Fragment,
	createInterpolateElement,
	useState,
} from '@wordpress/element';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { Button, SpinnerButton } from 'googlesitekit-components';
import { CORE_LOCATION } from '../../googlesitekit/datastore/location/constants';
import { CORE_SITE } from '../../googlesitekit/datastore/site/constants';
import { CORE_USER } from '../../googlesitekit/datastore/user/constants';
import { MODULES_ANALYTICS } from '../../modules/analytics/datastore/constants';
import { Cell, Grid, Row } from '../../material-components';
import BannerGraphicsSVG from '../../../svg/graphics/consent-mode-setup.svg';
import {
	AdminMenuTooltip,
	useShowTooltip,
	useTooltipState,
} from '../AdminMenuTooltip';
import ErrorText from '../ErrorText';
import Link from '../Link';
import useViewOnly from '../../hooks/useViewOnly';
import { WEEK_IN_SECONDS } from '../../util';
import { CONSENT_MODE_SETUP_CTA_WIDGET_SLUG } from './constants';

const { useSelect, useDispatch } = Data;

export default function ConsentModeSetupCTAWidget( { Widget, WidgetNull } ) {
	const [ isSaving, setIsSaving ] = useState( false );
	const [ saveError, setSaveError ] = useState( null );

	const viewOnlyDashboard = useViewOnly();

	const isConsentModeEnabled = useSelect( ( select ) =>
		select( CORE_SITE ).isConsentModeEnabled()
	);

	const isAdsConnected = useSelect( ( select ) =>
		// TODO: Replace this with the `analytics-4` or `ads` version of the `getAdsConversionID()` selector once it's migrated.
		select( MODULES_ANALYTICS ).getAdsConversionID()
	);

	const settingsURL = useSelect( ( select ) =>
		select( CORE_SITE ).getAdminURL( 'googlesitekit-settings' )
	);

	const consentModeDocumentationURL = useSelect( ( select ) =>
		select( CORE_SITE ).getDocumentationLinkURL( 'consent-mode' )
	);

	const showTooltip = useShowTooltip( CONSENT_MODE_SETUP_CTA_WIDGET_SLUG );
	const { isTooltipVisible } = useTooltipState(
		CONSENT_MODE_SETUP_CTA_WIDGET_SLUG
	);

	const isDismissed = useSelect( ( select ) =>
		select( CORE_USER ).isPromptDismissed(
			CONSENT_MODE_SETUP_CTA_WIDGET_SLUG
		)
	);
	const dismissCount = useSelect( ( select ) =>
		select( CORE_USER ).getPromptDismissCount(
			CONSENT_MODE_SETUP_CTA_WIDGET_SLUG
		)
	);

	const { setConsentModeEnabled, saveConsentModeSettings } =
		useDispatch( CORE_SITE );
	const { dismissPrompt } = useDispatch( CORE_USER );
	const { navigateTo } = useDispatch( CORE_LOCATION );

	if ( isTooltipVisible ) {
		return (
			<Fragment>
				<WidgetNull />
				<AdminMenuTooltip
					title=""
					content={ __(
						'You can always enable consent mode from Settings later',
						'google-site-kit'
					) }
					dismissLabel={ __( 'Got it', 'google-site-kit' ) }
					tooltipStateKey={ CONSENT_MODE_SETUP_CTA_WIDGET_SLUG }
				/>
			</Fragment>
		);
	}

	const shouldShowWidget =
		! viewOnlyDashboard &&
		( isSaving ||
			( isDismissed === false &&
				! isConsentModeEnabled &&
				isAdsConnected ) );

	if ( ! shouldShowWidget ) {
		return <WidgetNull />;
	}

	const handleCTAClick = async () => {
		setSaveError( null );
		setIsSaving( true );

		setConsentModeEnabled( true );
		const { error } = await saveConsentModeSettings();

		if ( error ) {
			setSaveError( error );
			setConsentModeEnabled( false );
			setIsSaving( false );
		} else {
			await dismissPrompt( CONSENT_MODE_SETUP_CTA_WIDGET_SLUG );
			navigateTo( `${ settingsURL }#/admin-settings` );
		}
	};

	const handleDismissClick = async () => {
		// For the first two dismissals, we show the notification again in two weeks.
		if ( dismissCount < 2 ) {
			showTooltip();

			const twoWeeksInSeconds = WEEK_IN_SECONDS * 2;
			await dismissPrompt( CONSENT_MODE_SETUP_CTA_WIDGET_SLUG, {
				expiresInSeconds: twoWeeksInSeconds,
			} );
		} else {
			// For the third dismissal, dismiss permanently.
			await dismissPrompt( CONSENT_MODE_SETUP_CTA_WIDGET_SLUG );
		}
	};

	return (
		<Widget
			noPadding
			className="googlesitekit-consent-mode-setup-cta-widget"
		>
			<Grid collapsed>
				<Row>
					<Cell
						smSize={ 6 }
						mdSize={ 8 }
						lgSize={ 6 }
						className="googlesitekit-consent-mode-setup-cta-widget__primary-cell"
					>
						<h3 className="googlesitekit-consent-mode-setup-cta-widget__title">
							{ __(
								'Enable Consent Mode to preserve tracking for your Ads campaigns',
								'google-site-kit'
							) }
						</h3>
						<p className="googlesitekit-consent-mode-setup-cta-widget__description">
							{ createInterpolateElement(
								__(
									'Consent mode interacts with your Consent Management Platform (CMP) or custom implementation for obtaining visitor consent, such as a cookie consent banner. <a>Learn more</a>',
									'google-site-kit'
								),
								{
									a: (
										<Link
											href={ consentModeDocumentationURL }
											external
											aria-label={ __(
												'Learn more about consent mode',
												'google-site-kit'
											) }
										/>
									),
								}
							) }
						</p>
						{ saveError && (
							<ErrorText message={ saveError.message } />
						) }
						<div className="googlesitekit-consent-mode-setup-cta-widget__actions-wrapper">
							<Fragment>
								<SpinnerButton
									onClick={ handleCTAClick }
									isSaving={ isSaving }
								>
									{ __(
										'Enable consent mode',
										'google-site-kit'
									) }
								</SpinnerButton>
								<Button tertiary onClick={ handleDismissClick }>
									{ dismissCount < 2
										? __( 'Maybe later', 'google-site-kit' )
										: __(
												'Don’t show again',
												'google-site-kit'
										  ) }
								</Button>
							</Fragment>
						</div>
					</Cell>
					<Cell
						alignBottom
						className="googlesitekit-consent-mode-setup-cta-widget__svg-wrapper"
						smSize={ 6 }
						mdSize={ 8 }
						lgSize={ 6 }
					>
						<BannerGraphicsSVG />
					</Cell>
				</Row>
			</Grid>
		</Widget>
	);
}

ConsentModeSetupCTAWidget.propTypes = {
	Widget: PropTypes.elementType.isRequired,
	WidgetNull: PropTypes.elementType.isRequired,
};
