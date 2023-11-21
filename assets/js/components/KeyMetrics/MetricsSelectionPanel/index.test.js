/**
 * MetricsSelectionPanel component tests.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
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
import MetricsSelectionPanel from '.';
import { act, fireEvent, render } from '../../../../../tests/js/test-utils';
import {
	createTestRegistry,
	freezeFetch,
	provideKeyMetrics,
	provideModules,
	provideUserAuthentication,
	provideUserInfo,
	subscribeUntil,
} from '../../../../../tests/js/utils';
import { CORE_UI } from '../../../googlesitekit/datastore/ui/constants';
import {
	CORE_USER,
	KM_ANALYTICS_ENGAGED_TRAFFIC_SOURCE,
	KM_ANALYTICS_RETURNING_VISITORS,
	KM_ANALYTICS_NEW_VISITORS,
	KM_ANALYTICS_POPULAR_CONTENT,
	KM_ANALYTICS_TOP_CONVERTING_TRAFFIC_SOURCE,
	KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES,
	KM_ANALYTICS_TOP_TRAFFIC_SOURCE,
	KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
} from '../../../googlesitekit/datastore/user/constants';
import { KEY_METRICS_SELECTION_PANEL_OPENED_KEY } from '../constants';
import { VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY } from '../../../googlesitekit/constants';
import { provideKeyMetricsWidgetRegistrations } from '../test-utils';
import * as analytics4Fixtures from '../../../modules/analytics-4/datastore/__fixtures__';
import {
	MODULES_ANALYTICS,
	EDIT_SCOPE,
} from '../../../modules/analytics/datastore/constants';
import {
	FORM_CUSTOM_DIMENSIONS_CREATE,
	MODULES_ANALYTICS_4,
} from '../../../modules/analytics-4/datastore/constants';
import { CORE_FORMS } from '../../../googlesitekit/datastore/forms/constants';

describe( 'MetricsSelectionPanel', () => {
	let registry;

	const coreKeyMetricsEndpointRegExp = new RegExp(
		'^/google-site-kit/v1/core/user/data/key-metrics'
	);

	beforeEach( () => {
		registry = createTestRegistry();

		freezeFetch( coreKeyMetricsEndpointRegExp );

		provideUserAuthentication( registry );

		registry.dispatch( CORE_USER ).receiveCapabilities( {
			googlesitekit_manage_options: true,
		} );

		registry.dispatch( MODULES_ANALYTICS_4 ).setSettings( {
			propertyID: 1234567,
			availableCustomDimensions: [],
		} );

		registry
			.dispatch( CORE_UI )
			.setValue( KEY_METRICS_SELECTION_PANEL_OPENED_KEY, true );

		// jsdom does not support scrollIntoView which is used by the last metric item
		// to prevent it from hiding underneath the Custom Dimensions warning notice.
		// See: https://github.com/jsdom/jsdom/issues/1695.
		Element.prototype.scrollIntoView = jest.fn();
	} );

	describe( 'Metrics', () => {
		it( 'should list metrics regardless of modules being connected or not', () => {
			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: false,
					connected: false,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
			} );

			render( <MetricsSelectionPanel />, { registry } );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).toHaveTextContent( 'Returning visitors' );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).toHaveTextContent( 'Top performing keywords' );
		} );

		it( 'should render a single module disconnect notice when required module for a widget is disconnected', () => {
			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
				{
					slug: 'search-console',
					active: false,
					connected: false,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
			} );

			render( <MetricsSelectionPanel />, { registry } );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).toHaveTextContent(
				'Search Console is disconnected, no data to show'
			);
		} );

		it( 'should render a multiple module disconnect notice when required module for a widget is disconnected', () => {
			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: false,
					connected: false,
				},
				{
					slug: 'search-console',
					active: false,
					connected: false,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4', 'search-console' ],
				},
			} );

			render( <MetricsSelectionPanel />, { registry } );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).toHaveTextContent(
				'Analytics 4 and Search Console are disconnected, no data to show'
			);
		} );

		it( 'should disable unchecked metrics when four metrics are checked', () => {
			const metrics = [
				KM_ANALYTICS_RETURNING_VISITORS,
				KM_ANALYTICS_NEW_VISITORS,
				KM_ANALYTICS_TOP_TRAFFIC_SOURCE,
				KM_ANALYTICS_ENGAGED_TRAFFIC_SOURCE,
				KM_ANALYTICS_POPULAR_CONTENT,
			];

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
			] );

			provideKeyMetricsWidgetRegistrations(
				registry,
				metrics.reduce(
					( acc, widget ) => ( {
						...acc,
						[ widget ]: {
							modules: [ 'analytics-4' ],
						},
					} ),
					{}
				)
			);

			// Set the first four metrics as selected.
			provideKeyMetrics( registry, {
				widgetSlugs: metrics.slice( 0, 4 ),
			} );

			const { getByRole } = render( <MetricsSelectionPanel />, {
				registry,
			} );

			// Verify that the fifth metric is disabled.
			expect(
				getByRole( 'checkbox', {
					name: /Most popular content/i,
				} )
			).toBeDisabled();
		} );

		it( 'should disable metrics that depend on a disconnected analytics-4 module', () => {
			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: false,
					connected: false,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
			} );

			// Set only the Search Console metric as selected.
			provideKeyMetrics( registry, {
				widgetSlugs: [ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ],
			} );

			const { getByRole } = render( <MetricsSelectionPanel />, {
				registry,
			} );

			// Verify the limit of 4 metrics is not reached.
			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-footer__metric-count'
				)
			).toHaveTextContent( '1 of 4 selected' );

			// Verify that the metric dependent on a disconnected analytics-4 is disabled.
			expect(
				getByRole( 'checkbox', {
					name: /Returning visitors/i,
				} )
			).toBeDisabled();

			// Verify that the metric not dependent on a disconnected analytics-4 is enabled.
			expect(
				getByRole( 'checkbox', {
					name: /Top performing keywords/i,
				} )
			).not.toBeDisabled();
		} );

		it( 'should order pre-saved metrics to the top', () => {
			const metrics = [
				KM_ANALYTICS_RETURNING_VISITORS,
				KM_ANALYTICS_NEW_VISITORS,
				KM_ANALYTICS_TOP_TRAFFIC_SOURCE,
				KM_ANALYTICS_TOP_CONVERTING_TRAFFIC_SOURCE,
			];

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
			] );

			provideKeyMetricsWidgetRegistrations(
				registry,
				metrics.reduce(
					( acc, widget ) => ( {
						...acc,
						[ widget ]: {
							modules: [ 'analytics-4' ],
						},
					} ),
					{}
				)
			);

			// Set the last metric as selected.
			provideKeyMetrics( registry, {
				widgetSlugs: [ KM_ANALYTICS_TOP_CONVERTING_TRAFFIC_SOURCE ],
			} );

			render( <MetricsSelectionPanel />, { registry } );

			// Verify that the last metric is positioned at the top.
			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics__metric-item:first-child label'
				)
			).toHaveTextContent( 'Top converting traffic source' );
		} );

		it( 'should not list metrics dependent on modules that a view-only user does not have access to', async () => {
			provideUserAuthentication( registry, { authenticated: false } );

			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
			] );

			registry.dispatch( CORE_USER ).receiveGetUserInputSettings( {
				purpose: {
					values: [ 'purpose1' ],
					scope: 'site',
				},
				postFrequency: {
					values: [ 'daily' ],
					scope: 'user',
				},
				goals: {
					values: [ 'goal1', 'goal2' ],
					scope: 'user',
				},
			} );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
			} );

			// Provide shared access to Search Console but not to GA4.
			registry.dispatch( CORE_USER ).receiveGetCapabilities( {
				'googlesitekit_read_shared_module_data::["analytics-4"]': false,
				'googlesitekit_read_shared_module_data::["search-console"]': true,
			} );

			registry
				.dispatch( MODULES_ANALYTICS )
				.receiveGetSettings( analytics4Fixtures.defaultSettings );

			const { waitForRegistry } = render( <MetricsSelectionPanel />, {
				registry,
				viewContext: VIEW_CONTEXT_MAIN_DASHBOARD_VIEW_ONLY,
			} );

			await waitForRegistry();

			// Verify that a metric dependent on GA4 isn't listed.
			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).not.toHaveTextContent( 'Returning visitors' );

			// Verify that a metric dependent on Search Console is listed.
			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-metrics'
				)
			).toHaveTextContent( 'Top performing keywords' );
		} );
	} );

	describe( 'Notice', () => {
		beforeEach( () => {
			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
				[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]: {
					modules: [ 'analytics-4' ],
				},
			} );

			provideKeyMetrics( registry, {
				widgetSlugs: [
					KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
					KM_ANALYTICS_RETURNING_VISITORS,
				],
			} );

			registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
				availableCustomDimensions: [],
			} );
		} );

		it( 'should display appropriate notice when a metric requires custom dimensions and does not have edit scope', async () => {
			const { container, getByText, findByLabelText } = render(
				<MetricsSelectionPanel />,
				{
					registry,
					features: [ 'keyMetrics' ],
				}
			);

			// Verify that the message is not displayed by default.
			expect( container ).not.toHaveTextContent(
				'The metrics you selected require more data tracking. You will be directed to update your Analytics property after saving your selection.'
			);

			const checkbox = await findByLabelText(
				'Top recent trending pages'
			);
			fireEvent.click( checkbox );

			expect(
				getByText(
					/The metrics you selected require more data tracking. You will be directed to update your Analytics property after saving your selection./i
				)
			).toBeInTheDocument();
		} );

		it( 'should display appropriate message when a metric requires custom dimensions and has edit scope', async () => {
			provideUserAuthentication( registry, {
				grantedScopes: EDIT_SCOPE,
			} );

			const { container, getByText, findByLabelText } = render(
				<MetricsSelectionPanel />,
				{
					registry,
					features: [ 'keyMetrics' ],
				}
			);

			// Verify that the message is not displayed by default.
			expect( container ).not.toHaveTextContent(
				'The metrics you selected require more data tracking. We will update your Analytics property after saving your selection.'
			);

			const checkbox = await findByLabelText(
				'Top recent trending pages'
			);
			fireEvent.click( checkbox );

			expect(
				getByText(
					/The metrics you selected require more data tracking. We will update your Analytics property after saving your selection./i
				)
			).toBeInTheDocument();
		} );
	} );

	describe( 'Footer', () => {
		beforeEach( () => {
			provideKeyMetrics( registry );

			provideModules( registry, [
				{
					slug: 'analytics-4',
					active: true,
					connected: true,
				},
			] );

			provideKeyMetricsWidgetRegistrations( registry, {
				[ KM_SEARCH_CONSOLE_POPULAR_KEYWORDS ]: {
					modules: [ 'search-console' ],
				},
				[ KM_ANALYTICS_RETURNING_VISITORS ]: {
					modules: [ 'analytics-4' ],
				},
				[ KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES ]: {
					modules: [ 'analytics-4' ],
				},
			} );
		} );

		it( 'should prevent saving when less than two metrics are checked', () => {
			render( <MetricsSelectionPanel />, { registry } );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-footer .googlesitekit-button-icon--spinner'
				)
			).toBeDisabled();
		} );

		it( 'should display error message when less than two metrics are checked', async () => {
			const { findByLabelText } = render( <MetricsSelectionPanel />, {
				registry,
			} );

			// Select 1 key metric.
			const checkbox = await findByLabelText(
				'Top recent trending pages'
			);
			fireEvent.click( checkbox );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-footer .googlesitekit-error-text'
				).textContent
			).toBe( 'Select at least 2 metrics' );

			// Select 2 key metrics.
			const checkbox2 = await findByLabelText(
				'Top performing keywords'
			);
			fireEvent.click( checkbox2 );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-footer .googlesitekit-error-text'
				)
			).not.toBeInTheDocument();
		} );

		describe( 'CTA', () => {
			it( 'should set autoSubmit to true if GA4 connected and missing custom dimensions', async () => {
				fetchMock.reset();

				provideUserAuthentication( registry, {
					grantedScopes: EDIT_SCOPE,
				} );
				provideUserInfo( registry, { id: 1 } );

				fetchMock.postOnce( coreKeyMetricsEndpointRegExp, {
					body: {
						widgetSlugs: [
							KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
							KM_ANALYTICS_RETURNING_VISITORS,
							KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES,
						],
						isWidgetHidden: false,
					},
					status: 200,
				} );

				provideKeyMetrics( registry, {
					widgetSlugs: [
						KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
						KM_ANALYTICS_RETURNING_VISITORS,
						KM_ANALYTICS_TOP_RECENT_TRENDING_PAGES,
					],
				} );

				registry.dispatch( MODULES_ANALYTICS_4 ).receiveGetSettings( {
					availableCustomDimensions: [],
				} );

				const { getByRole } = render( <MetricsSelectionPanel />, {
					registry,
					features: [ 'keyMetrics' ],
				} );

				const submitButton = getByRole( 'button', {
					name: /Save selection/i,
				} );

				const isAutoSubmitTrue = () => {
					const autoSubmit = registry
						.select( CORE_FORMS )
						.getValue(
							FORM_CUSTOM_DIMENSIONS_CREATE,
							'autoSubmit'
						);
					return autoSubmit === true;
				};

				await act( async () => {
					fireEvent.click( submitButton );
					// Wait for autoSubmit to become true.
					await subscribeUntil( registry, isAutoSubmitTrue );
				} );

				const finalAutoSubmitValue = registry
					.select( CORE_FORMS )
					.getValue( FORM_CUSTOM_DIMENSIONS_CREATE, 'autoSubmit' );
				expect( finalAutoSubmitValue ).toBe( true );
			} );

			it( "should have 'Save selection' label if there are no pre-saved key metrics", () => {
				provideKeyMetrics( registry );

				const { getByRole } = render( <MetricsSelectionPanel />, {
					registry,
				} );

				expect(
					getByRole( 'button', {
						name: /Save selection/i,
					} )
				).toBeInTheDocument();
			} );

			it( "should have 'Save selection' label if there are pre-saved key metrics", () => {
				provideKeyMetrics( registry, {
					widgetSlugs: [
						KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
						KM_ANALYTICS_RETURNING_VISITORS,
					],
				} );

				const { getByRole } = render( <MetricsSelectionPanel />, {
					registry,
				} );

				expect(
					getByRole( 'button', {
						name: /Save selection/i,
					} )
				).toBeInTheDocument();
			} );

			it( "should have 'Apply changes' label if pre-saved key metrics are changed", async () => {
				provideKeyMetrics( registry, {
					widgetSlugs: [
						KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
						KM_ANALYTICS_RETURNING_VISITORS,
					],
				} );

				const { getByRole, findByLabelText } = render(
					<MetricsSelectionPanel />,
					{
						registry,
					}
				);

				// Button should be unchanged with pre-saved metrics.
				expect(
					getByRole( 'button', {
						name: /Save selection/i,
					} )
				).toBeInTheDocument();

				// Uncheck one of the selected metrics to trigger
				// the button label change.
				const checkbox = await findByLabelText( 'Returning visitors' );
				fireEvent.click( checkbox );

				expect(
					getByRole( 'button', {
						name: /Apply changes/i,
					} )
				).toBeInTheDocument();
			} );
		} );

		it( 'should show the number of selected metrics', () => {
			provideKeyMetrics( registry, {
				widgetSlugs: [
					KM_SEARCH_CONSOLE_POPULAR_KEYWORDS,
					KM_ANALYTICS_RETURNING_VISITORS,
				],
			} );

			render( <MetricsSelectionPanel />, { registry } );

			expect(
				document.querySelector(
					'.googlesitekit-km-selection-panel-footer__metric-count'
				)
			).toHaveTextContent( '2 of 4 selected' );
		} );
	} );
} );
