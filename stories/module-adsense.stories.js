/**
 * External dependencies
 */
import { storiesOf } from '@storybook/react';

/**
 * WordPress dependencies
 */
import { doAction } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Layout from '../assets/js/components/layout/layout';
import AdSensePerformanceWidget from '../assets/js/modules/adsense/components/dashboard/AdSensePerformanceWidget';
import DashboardZeroData from '../assets/js/modules/adsense/components/dashboard/DashboardZeroData';
import { googlesitekit as adSensePerformanceModuleData } from '../.storybook/data/wp-admin-admin.php-page=googlesitekit-module-adsense-googlesitekitPerformanceModule';
import {
	AccountSelect,
	UseSnippetSwitch,
	AdBlockerWarning,
	UserProfile,
	SiteSteps,
} from '../assets/js/modules/adsense/components/common';
import { WithTestRegistry } from '../tests/js/utils';
import * as fixtures from '../assets/js/modules/adsense/datastore/__fixtures__';
import { STORE_NAME } from '../assets/js/modules/adsense/datastore/constants';

function SetupWrap( { children } ) {
	return (
		<div className="googlesitekit-setup">
			<section className="googlesitekit-setup__wrapper">
				<div className="googlesitekit-setup-module">
					{ children }
				</div>
			</section>
		</div>
	);
}

storiesOf( 'AdSense Module', module )
	.add( 'Account Select, none selected', () => {
		const accounts = fixtures.accountsMultiple;
		const setupRegistry = ( { dispatch } ) => {
			dispatch( STORE_NAME ).receiveGetAccounts( accounts );
			dispatch( STORE_NAME ).receiveGetSettings( {} );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<AccountSelect />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'Account Select, selected', () => {
		const accounts = fixtures.accountsMultiple;
		const setupRegistry = ( { dispatch } ) => {
			dispatch( STORE_NAME ).receiveGetAccounts( accounts );
			dispatch( STORE_NAME ).receiveGetSettings( {
				accountID: accounts[ 0 ].id,
			} );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<AccountSelect />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'Use Snippet Switch, toggled on (default)', () => {
		const setupRegistry = ( { dispatch } ) => {
			dispatch( STORE_NAME ).setUseSnippet( true );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<UseSnippetSwitch />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'Use Snippet Switch, toggled off', () => {
		const setupRegistry = ( { dispatch } ) => {
			dispatch( STORE_NAME ).setUseSnippet( false );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<UseSnippetSwitch />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'AdBlocker Warning', () => {
		const setupRegistry = ( { dispatch } ) => {
			dispatch( STORE_NAME ).receiveIsAdBlockerActive( true );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<AdBlockerWarning />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'User Profile', () => {
		const setupRegistry = () => {};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<div className="googlesitekit-setup-module__inputs">
						<UserProfile />
					</div>
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'Site Steps', () => {
		const setupRegistry = ( registry ) => {
			registry.dispatch( STORE_NAME ).setAccountID( fixtures.accounts[ 0 ].id );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<SetupWrap>
					<SiteSteps />
				</SetupWrap>
			</WithTestRegistry>
		);
	} )
	.add( 'Dashboard Zero Data', () => {
		const setupRegistry = ( registry ) => {
			registry.dispatch( STORE_NAME ).setAccountID( fixtures.accounts[ 0 ].id );
		};

		return (
			<WithTestRegistry callback={ setupRegistry }>
				<Layout fill>
					<DashboardZeroData />
				</Layout>
			</WithTestRegistry>
		);
	} )
	.add( 'Performance', () => {
		global._googlesitekitLegacyData = adSensePerformanceModuleData;

		// Load the datacache with data.
		setTimeout( () => {
			doAction(
				'googlesitekit.moduleLoaded',
				'Single'
			);
		}, 250 );

		return (
			<WithTestRegistry>
				<Layout
					header
					title={ __( 'Performance over the last 28 days', 'google-site-kit' ) }
					headerCTALabel={ __( 'See full stats in AdSense', 'google-site-kit' ) }
					headerCTALink="#"
				>
					<AdSensePerformanceWidget />
				</Layout>
			</WithTestRegistry>
		);
	} )
;
