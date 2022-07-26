/**
 * Thank with Google Main Setup component.
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
import { _x, __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import ThankWithGoogleIcon from '../../../../../svg/graphics/thank-with-google.svg';
import ThankWithGoogleSetup from '../../../../../svg/graphics/thank-with-google-setup.svg';
import ProgressBar from '../../../../components/ProgressBar';
import Badge from '../../../../components/Badge';
import { Grid, Row, Cell } from '../../../../material-components';
import { MODULES_THANK_WITH_GOOGLE } from '../../datastore/constants';
import SetupCreatePublication from './SetupCreatePublication';
import SetupCustomize from './SetupCustomize';
import SetupPublicationActive from './SetupPublicationActive';
import SetupPublicationActionRequired from './SetupPublicationActionRequired';
import SetupPublicationPendingVerification from './SetupPublicationPendingVerification';
import StoreErrorNotices from '../../../../components/StoreErrorNotices';
const { useSelect } = Data;

export default function SetupMain( { finishSetup } ) {
	const hasErrors = useSelect( ( select ) =>
		select( MODULES_THANK_WITH_GOOGLE ).hasErrors()
	);
	const publicationID = useSelect( ( select ) =>
		select( MODULES_THANK_WITH_GOOGLE ).getPublicationID()
	);
	const currentPublication = useSelect( ( select ) =>
		select( MODULES_THANK_WITH_GOOGLE ).getCurrentPublication()
	);

	let viewComponent;

	if ( hasErrors ) {
		viewComponent = (
			<StoreErrorNotices
				moduleSlug="thank-with-google"
				storeName={ MODULES_THANK_WITH_GOOGLE }
			/>
		);
	} else if ( currentPublication === undefined ) {
		viewComponent = <ProgressBar />;
	} else if ( currentPublication === null ) {
		viewComponent = <SetupCreatePublication />;
	} else if ( currentPublication.state === 'ACTION_REQUIRED' ) {
		viewComponent = <SetupPublicationActionRequired />;
	} else if ( currentPublication.state === 'PENDING_VERIFICATION' ) {
		viewComponent = <SetupPublicationPendingVerification />;
	} else if ( currentPublication.state === 'ACTIVE' && ! publicationID ) {
		viewComponent = (
			<SetupPublicationActive
				// eslint-disable-next-line sitekit/acronym-case
				currentPublicationID={ currentPublication.publicationId }
			/>
		);
	} else if ( currentPublication.state === 'ACTIVE' && publicationID ) {
		viewComponent = <SetupCustomize finishSetup={ finishSetup } />;
	}

	return (
		<div className="googlesitekit-setup-module googlesitekit-setup-module--thank-with-google">
			<Grid>
				<Row className="googlesitekit-setup__content">
					<Cell
						smSize={ 4 }
						mdSize={ 8 }
						lgSize={ 6 }
						lgOrder={ 2 }
						className="googlesitekit-setup__icon"
					>
						<ThankWithGoogleSetup width={ 360 } height={ 210 } />
					</Cell>
					<Cell smSize={ 4 } mdSize={ 8 } lgSize={ 6 } lgOrder={ 1 }>
						<div className="googlesitekit-setup-module__header">
							<div className="googlesitekit-setup-module__heading">
								<div className="googlesitekit-setup-module__logo">
									<ThankWithGoogleIcon
										width="40"
										height="39"
									/>
								</div>

								<h2 className="googlesitekit-heading-3 googlesitekit-setup-module__title">
									{ _x(
										'Thank with Google',
										'Service name',
										'google-site-kit'
									) }
								</h2>
							</div>

							<Badge
								label={ __(
									'Experimental',
									'google-site-kit'
								) }
							/>
							<Badge
								label={ __( 'US Only', 'google-site-kit' ) }
							/>
						</div>

						{ viewComponent }
					</Cell>
				</Row>
			</Grid>
		</div>
	);
}

SetupMain.propTypes = {
	finishSetup: PropTypes.func,
};

SetupMain.defaultProps = {
	finishSetup: () => {},
};
