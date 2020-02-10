/**
 * WPDashboard component.
 *
 * Site Kit by Google, Copyright 2019 Google LLC
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
/* eslint camelcase:[0] */

/**
 * External dependencies
 */
import Notification from 'GoogleComponents/notifications/notification';
import { loadTranslations } from 'GoogleUtil';
import 'GoogleModules';

/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { doAction } from '@wordpress/hooks';
import { Component, render } from '@wordpress/element';

// Load the data module.
/**
 * Internal dependencies
 */
import 'GoogleComponents/data';

/**
 * Internal dependencies.
 */
import WPDashboardMain from './components/wp-dashboard/wp-dashboard-main';

class GoogleSitekitWPDashboard extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			hasError: false,
		};
	}

	componentDidCatch( error, info ) {
		this.setState( {
			hasError: true,
			error,
			info,
		} );
	}

	render() {
		const {
			hasError,
			error,
			info,
		} = this.state;

		if ( hasError ) {
			return <Notification
				id={ 'googlesitekit-error' }
				key={ 'googlesitekit-error' }
				title={ error.message }
				description={ info.componentStack }
				dismiss={ '' }
				isDismissable={ false }
				format="small"
				type="win-error"
			/>;
		}
		return <WPDashboardMain />;
	}
}

// Initialize the app once the DOM is ready.
domReady( () => {
	const renderTarget = document.getElementById( 'js-googlesitekit-wp-dashboard' );

	if ( renderTarget ) {
		loadTranslations();

		render( <GoogleSitekitWPDashboard />, renderTarget );

		/**
		 * Action triggered when the WP Dashboard App is loaded.
	 	*/
		doAction( 'googlesitekit.moduleLoaded', 'WPDashboard' );
	}
} );
