/**
 * ModulesListItem component.
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
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Link from './Link';
import ModuleIcon from './ModuleIcon';
import ModuleSettingsWarning from './legacy-notifications/module-settings-warning';
import Data from 'googlesitekit-data';
import { CORE_MODULES } from '../googlesitekit/modules/datastore/constants';
const { useSelect } = Data;

const ModulesListItem = ( { module, handleSetupModule } ) => {
	const { slug, name, connected, active } = module;
	const setupComplete = connected && active;

	const canActivateModule = useSelect( ( select ) =>
		select( CORE_MODULES ).canActivateModule( slug )
	);

	return (
		<div
			className={ classnames(
				'googlesitekit-modules-list__module',
				`googlesitekit-modules-list__module--${ slug }`,
				{
					'googlesitekit-settings-connect-module--disabled':
						! setupComplete && ! canActivateModule,
				}
			) }
		>
			<div className="googlesitekit-settings-connect-module__wrapper">
				<div className="googlesitekit-settings-connect-module__logo">
					<ModuleIcon slug={ slug } />
				</div>

				<h3 className="googlesitekit-settings-connect-module__title">
					{ name }
				</h3>
			</div>

			{ ! setupComplete && (
				<ModuleSettingsWarning slug={ slug } context="modules-list" />
			) }

			{ setupComplete && (
				<span className="googlesitekit-settings-module__status">
					<span className="googlesitekit-settings-module__status-icon googlesitekit-settings-module__status-icon--connected" />
					{ __( 'Connected', 'google-site-kit' ) }
				</span>
			) }

			{ ! setupComplete && (
				<Link
					onClick={ () => handleSetupModule( slug ) }
					arrow
					small
					inherit
					disabled={ ! canActivateModule }
				>
					{ __( 'Connect Service', 'google-site-kit' ) }
				</Link>
			) }
		</div>
	);
};

export default ModulesListItem;
