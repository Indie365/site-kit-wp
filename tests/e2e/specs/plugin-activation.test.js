/**
 * WordPress dependencies
 */
import { deactivatePlugin, activatePlugin } from '@wordpress/e2e-test-utils';

describe( 'Plugin Activation Notice', () => {
	beforeEach( async() => {
		await deactivatePlugin( 'google-site-kit' );
	} );

	afterEach( async() => {
		await activatePlugin( 'google-site-kit' );
	} );

	it( 'Should be displayed', async() => {
		await activatePlugin( 'google-site-kit' );

		await page.waitForSelector( '.googlesitekit-activation' );

		const activationTitle = await page.$x(
			'//h3[contains(@class,"googlesitekit-activation__title") and contains(text(), "Congratulations, the Site Kit plugin is now activated.")]'
		);

		expect( activationTitle.length ).not.toEqual( 0 );

		await deactivatePlugin( 'google-site-kit' );
	} );

	it( 'Should lead you to the setup wizard', async() => {
		await activatePlugin( 'google-site-kit' );

		await page.waitForSelector( '.googlesitekit-activation' );

		const setupButton = await page.$x(
			'//a[contains(@class,"googlesitekit-activation__button") and contains(text(), "Start Setup")]'
		);

		expect( setupButton.length ).not.toEqual( 0 );

		await page.click( '.googlesitekit-activation__button' );
		await page.waitForSelector( '.googlesitekit-wizard-step__title' );

		const welcomeTitle = await page.$x(
			'//h2[contains(@class,"googlesitekit-wizard-step__title") and contains(text(), "Welcome to Site Kit beta for developers.")]'
		);

		expect( welcomeTitle.length ).not.toEqual( 0 );

		await deactivatePlugin( 'google-site-kit' );

	} );
} );
