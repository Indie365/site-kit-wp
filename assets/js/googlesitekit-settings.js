/**
 * Settings component.
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
import SettingsApp from 'GoogleComponents/settings/settings-app';
import Notification from 'GoogleComponents/notifications/notification';
import 'GoogleComponents/notifications';
import { loadTranslations } from 'GoogleUtil';
import 'GoogleModules';

/**
 * WordPress dependencies
 */
import domReady from '@wordpress/dom-ready';
import { doAction } from '@wordpress/hooks';
import { Component, render } from '@wordpress/element';

class GoogleSitekitSettings extends Component {
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

		return <SettingsApp />;
	}
}

// Initialize the app once the DOM is ready.
domReady( () => {
	const renderTarget = document.getElementById( 'googlesitekit-settings-wrapper' );

	if ( renderTarget ) {
		loadTranslations();

		render( <GoogleSitekitSettings />, renderTarget );

		/**
		 * Action triggered when the settings App is loaded.
		 */
		doAction( 'googlesitekit.moduleLoaded', 'Settings' );
	}
} );
