/**
 * DashboardPageSpeed component tests.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
 * Internal dependencies
 */
import DashboardPageSpeed from './DashboardPageSpeed';
import { fireEvent, render } from '../../../../../tests/js/test-utils';
import { STORE_NAME, STRATEGY_MOBILE, STRATEGY_DESKTOP } from '../datastore/constants';
import { STORE_NAME as CORE_SITE } from '../../../googlesitekit/datastore/site/constants';
import * as fixtures from '../datastore/__fixtures__';
import fetchMock from 'fetch-mock';

// TODO: update the active class.
const activeClass = 'googlesitekit-cta-link--danger';
const url = fixtures.pagespeedMobile.loadingExperience.id;
const setupRegistry = ( { dispatch } ) => {
	dispatch( STORE_NAME ).receiveGetReport( fixtures.pagespeedMobile, { url, strategy: STRATEGY_MOBILE } );
	dispatch( STORE_NAME ).receiveGetReport( fixtures.pagespeedDesktop, { url, strategy: STRATEGY_DESKTOP } );
	dispatch( CORE_SITE ).receiveSiteInfo( {
		referenceSiteURL: url,
		currentEntityURL: null,
	} );
};
const setupRegistryNoReports = ( { dispatch } ) => {
	dispatch( CORE_SITE ).receiveSiteInfo( {
		referenceSiteURL: url,
		currentEntityURL: null,
	} );
};
const setupRegistryNoFieldDataDesktop = ( { dispatch } ) => {
	// eslint-disable-next-line no-unused-vars
	const { metrics, ...desktopLoadingExperience } = fixtures.pagespeedDesktop.loadingExperience;
	dispatch( STORE_NAME ).receiveGetReport( fixtures.pagespeedMobile, { url, strategy: STRATEGY_MOBILE } );
	dispatch( STORE_NAME ).receiveGetReport( {
		...fixtures.pagespeedDesktop,
		loadingExperience: desktopLoadingExperience, // no field data metrics
	}, { url, strategy: STRATEGY_DESKTOP } );
	dispatch( CORE_SITE ).receiveSiteInfo( {
		referenceSiteURL: url,
		currentEntityURL: null,
	} );
};

describe( 'DashboardPageSpeed', () => {
	afterEach( fetchMock.mockClear );

	it( 'renders a progress bar while reports are requested', () => {
		fetchMock.get(
			/^\/google-site-kit\/v1\/modules\/pagespeed-insights\/data\/pagespeed/,
			new Promise( () => {} ), // Don't return a response.
		);
		const { queryByRole } = render( <DashboardPageSpeed />, { setupRegistry: setupRegistryNoReports } );

		expect( queryByRole( 'progressbar' ) ).toBeInTheDocument();
	} );

	it( 'displays field data by default when available in both mobile and desktop reports', () => {
		expect( fixtures.pagespeedMobile.loadingExperience ).toHaveProperty( 'metrics' );
		expect( fixtures.pagespeedDesktop.loadingExperience ).toHaveProperty( 'metrics' );

		const { getByText } = render( <DashboardPageSpeed />, { setupRegistry } );

		expect( getByText( /In the Field/i ) ).toHaveClass( activeClass );
	} );

	it( 'displays lab data by default when field data is not present in both mobile and desktop reports', () => {
		const { getByText } = render( <DashboardPageSpeed />, { setupRegistry: setupRegistryNoFieldDataDesktop } );

		expect( getByText( /In the Lab/i ) ).toHaveClass( activeClass );
		expect( getByText( /In the Field/i ) ).not.toHaveClass( activeClass );
	} );

	it( 'displays the mobile data by default', () => {
		const { getByText } = render( <DashboardPageSpeed />, { setupRegistry } );

		expect( getByText( /mobile/i ) ).toHaveClass( activeClass );
	} );

	it( 'has tabs for toggling the displayed data source', () => {
		const { getByText } = render( <DashboardPageSpeed />, { setupRegistry } );

		const labDataTabLink = getByText( /In the Lab/i );
		expect( labDataTabLink ).not.toHaveClass( activeClass );
		fireEvent.click( labDataTabLink );

		expect( labDataTabLink ).toHaveClass( activeClass );
		expect( getByText( /In the Field/i ) ).not.toHaveClass( activeClass );
	} );

	it( 'has tabs for toggling the tested device', () => {
		const { getByText } = render( <DashboardPageSpeed />, { setupRegistry } );

		const desktopToggle = getByText( /desktop/i );
		expect( desktopToggle ).not.toHaveClass( activeClass );

		fireEvent.click( desktopToggle );

		expect( desktopToggle ).toHaveClass( activeClass );
		expect( getByText( /mobile/i ) ).not.toHaveClass( activeClass );
	} );

	it( 'displays a "Field data unavailable" message when field data is not available', () => {
		const { getByText, queryByText, registry } = render( <DashboardPageSpeed />, { setupRegistry: setupRegistryNoFieldDataDesktop } );

		const { getReport } = registry.select( STORE_NAME );
		expect( getReport( url, STRATEGY_MOBILE ).loadingExperience ).toHaveProperty( 'metrics' );
		expect( getReport( url, STRATEGY_DESKTOP ).loadingExperience ).not.toHaveProperty( 'metrics' );

		// Lab data is shown by default as both reports do not have field data.
		expect( getByText( /In the Lab/i ) ).toHaveClass( activeClass );
		// Switch to Field data source.
		fireEvent.click( getByText( /In the Field/i ) );

		expect( getByText( /mobile/i ) ).toHaveClass( activeClass );
		// Mobile has field data, so ensure the no data message is not present.
		expect( queryByText( /Field data unavailable/i ) ).not.toBeInTheDocument();

		// Switch to desktop and expect to see the no data message.
		fireEvent.click( getByText( /desktop/i ) );

		expect( queryByText( /Field data unavailable/i ) ).toBeInTheDocument();
	} );
} );
