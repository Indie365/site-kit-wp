/**
 * Dashboard component.
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
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { clearWebStorage } from './util';
import { useFeature } from './hooks/useFeature';
import Root from './components/Root';
import ModuleSetup from './components/setup/ModuleSetup';
import DashboardApp from './components/dashboard/DashboardApp';
import DashboardMainApp from './components/DashboardMainApp';
import NotificationCounter from './components/legacy-notifications/notification-counter';
import './components/legacy-notifications';
import {
	VIEW_CONTEXT_DASHBOARD,
	VIEW_CONTEXT_MODULE_SETUP,
} from './googlesitekit/constants';

const GoogleSitekitDashboard = ( { setupModuleSlug } ) => {
	const unifiedDashboardEnabled = useFeature( 'unifiedDashboard' );

	if ( unifiedDashboardEnabled ) {
		return <DashboardMainApp />;
	}

	if ( !! setupModuleSlug ) {
		return <ModuleSetup moduleSlug={ setupModuleSlug } />;
	}

	return (
		<Fragment>
			<NotificationCounter />
			<DashboardApp />
		</Fragment>
	);
};

// Initialize the app once the DOM is ready.
domReady( () => {
	if ( global._googlesitekitLegacyData.admin.resetSession ) {
		clearWebStorage();
	}

	const renderTarget = document.getElementById(
		'js-googlesitekit-dashboard'
	);

	if ( renderTarget ) {
		const { setupModuleSlug } = renderTarget.dataset;

		render(
			<Root
				viewContext={
					setupModuleSlug
						? VIEW_CONTEXT_MODULE_SETUP
						: VIEW_CONTEXT_DASHBOARD
				}
			>
				<GoogleSitekitDashboard setupModuleSlug={ setupModuleSlug } />
			</Root>,
			renderTarget
		);
	}
} );
