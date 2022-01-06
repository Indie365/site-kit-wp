<?php

namespace Google\Site_Kit\Tests\Core\Authentication;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Authentication\Authentication;
use Google\Site_Kit\Core\Authentication\Google_Proxy;
use Google\Site_Kit\Core\Authentication\Setup_V2 as Setup;
use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Modules\Site_Verification;
use Google\Site_Kit\Tests\Exception\RedirectException;
use Google\Site_Kit\Tests\Fake_Site_Connection_Trait;
use Google\Site_Kit\Tests\MutableInput;
use Google\Site_Kit\Tests\TestCase;
use WPDieException;

/**
 * @group Authentication
 * @group Setup
 */
class Setup_V2Test extends TestCase {
	use Fake_Site_Connection_Trait;

	public function setUp() {
		parent::setUp();

		// Remove hooked actions for V1 during bootstrap.
		remove_all_actions( 'admin_action_' . Google_Proxy::ACTION_SETUP_START );
		remove_all_actions( 'admin_action_' . Google_Proxy::ACTION_SETUP );
	}

	/**
	 * @dataProvider data_actions
	 */
	public function test_action_handlers_die_on_invalid_nonce( $action ) {
		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$setup   = new Setup( $context, new User_Options( $context ), new Authentication( $context ) );
		$setup->register();

		// Ensure that wp_die is called if nonce verification fails.
		$_GET['nonce'] = 'bad-nonce';

		try {
			do_action( 'admin_action_' . $action );
		} catch ( WPDieException $exception ) {
			$this->assertStringStartsWith(
				'The link you followed has expired',
				$exception->getMessage()
			);

			return;
		}

		$this->fail( 'Expected WPDieException!' );
	}

	public function data_actions() {
		return array(
			Google_Proxy::ACTION_SETUP_START        => array( Google_Proxy::ACTION_SETUP_START ),
			Google_Proxy::ACTION_VERIFY             => array( Google_Proxy::ACTION_VERIFY ),
			Google_Proxy::ACTION_EXCHANGE_SITE_CODE => array( Google_Proxy::ACTION_EXCHANGE_SITE_CODE ),
		);
	}

	public function test_handle_action_setup_start__dies_if_insufficient_permissions() {
		$user_id = $this->factory()->user->create( array( 'role' => 'editor' ) );
		wp_set_current_user( $user_id );
		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$setup   = new Setup( $context, new User_Options( $context ), new Authentication( $context ) );
		$setup->register();

		$_GET['nonce'] = wp_create_nonce( Google_Proxy::ACTION_SETUP_START );

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_SETUP_START );
		} catch ( WPDieException $exception ) {
			$this->assertStringStartsWith(
				'You have insufficient permissions to connect Site Kit',
				$exception->getMessage()
			);

			return;
		}

		$this->fail( 'Expected WPDieException!' );
	}

	public function test_handle_action_setup_start__dies_if_not_using_proxy() {
		$this->fake_site_connection();
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$setup   = new Setup( $context, new User_Options( $context ), new Authentication( $context ) );
		$setup->register();

		$_GET['nonce'] = wp_create_nonce( Google_Proxy::ACTION_SETUP_START );

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_SETUP_START );
		} catch ( WPDieException $exception ) {
			$this->assertStringStartsWith(
				'Site Kit is not configured to use the authentication proxy',
				$exception->getMessage()
			);

			return;
		}

		$this->fail( 'Expected WPDieException!' );
	}

	/**
	 * @dataProvider data_conditionally_syncs_site_fields
	 */
	public function test_handle_action_setup_start__syncs_site_fields( $has_credentials ) {
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$setup   = new Setup( $context, new User_Options( $context ), new Authentication( $context ) );
		$setup->register();

		if ( $has_credentials ) {
			$this->fake_proxy_site_connection();
		}

		$_GET['code']  = 'test-code';
		$_GET['nonce'] = wp_create_nonce( Google_Proxy::ACTION_SETUP_START );

		// Capture URLs of all WP HTTP requests.
		$http_requests = array();
		$this->subscribe_to_wp_http_requests(
			function ( $url ) use ( &$http_requests ) {
				$http_requests[] = $url;
			}
		);

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_SETUP_START );
			$this->fail( 'Expected redirection to proxy setup URL!' );
		} catch ( RedirectException $redirect ) {
			$location = $redirect->get_location();
			$this->assertStringStartsWith( 'https://sitekit.withgoogle.com/site-management/setup/', $location );
		}

		$assertion = $has_credentials ? 'assertContains' : 'assertNotContains';

		$this->{$assertion}(
			( new Google_Proxy( $context ) )->url( Google_Proxy::OAUTH2_SITE_URI ),
			$http_requests
		);
	}

	public function data_conditionally_syncs_site_fields() {
		return array(
			'with credentials'    => array( true ),
			'without credentials' => array( false ),
		);
	}

	/**
	 * @dataProvider data_verification_tokens
	 */
	public function test_handle_action_verify( $token ) {
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$setup   = new Setup( $context, new User_Options( $context ), new Authentication( $context ) );
		$setup->register();

		if ( $token ) {
			$_GET['googlesitekit_verification_token']      = $token;
			$_GET['googlesitekit_verification_token_type'] = Site_Verification::VERIFICATION_TYPE_FILE;
		}

		$_GET['googlesitekit_code'] = 'test-code';
		$_GET['step']               = 'test-step';
		$_GET['nonce']              = wp_create_nonce( Google_Proxy::NONCE_ACTION );

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_VERIFY );
			$this->fail( 'Expected redirection to proxy setup URL!' );
		} catch ( RedirectException $redirect ) {
			$location = $redirect->get_location();
			$this->assertStringStartsWith( 'https://sitekit.withgoogle.com/site-management/setup/', $location );
			$this->assertContains( '&step=test-step', $location );
			$this->assertContains( '&verify=true', $location );
			$this->assertContains( '&verification_method=FILE', $location );
		} catch ( WPDieException $exception ) {
			$this->assertContains(
				'Verifying site ownership requires a token and verification method',
				$exception->getMessage()
			);
			$this->assertEmpty( $token );
		}

		if ( $token ) {
			$this->assertSame( 1, did_action( 'googlesitekit_verify_site_ownership' ) );
		} else {
			$this->assertSame( 0, did_action( 'googlesitekit_verify_site_ownership' ) );
		}
	}

	public function data_verification_tokens() {
		return array(
			'with token'    => array( 'test-verification-token' ),
			'without token' => array( null ),
		);
	}

	public function test_handle_action_verify__with_site_code() {
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$context        = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$authentication = new Authentication( $context );
		$setup          = new Setup( $context, new User_Options( $context ), $authentication );
		$setup->register();

		$_GET['nonce']                                 = wp_create_nonce( Google_Proxy::NONCE_ACTION );
		$_GET['googlesitekit_code']                    = 'test-code';
		$_GET['googlesitekit_site_code']               = 'test-site-code';
		$_GET['googlesitekit_verification_token']      = 'test-token';
		$_GET['googlesitekit_verification_token_type'] = Site_Verification::VERIFICATION_TYPE_FILE;

		$this->assertFalse( $authentication->credentials()->has() );

		// Stub the response to the proxy oauth API.
		$this->stub_oauth2_site_request( $_GET['googlesitekit_code'], $_GET['googlesitekit_site_code'] );

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_VERIFY );
			$this->fail( 'Expected redirection to proxy setup URL!' );
		} catch ( RedirectException $redirect ) {
			$location = $redirect->get_location();
			$this->assertStringStartsWith( 'https://sitekit.withgoogle.com/site-management/setup/', $location );
		}

		$this->assertSame( 1, did_action( 'googlesitekit_verify_site_ownership' ) );
		$this->assertTrue( $authentication->credentials()->has() );
	}

	/**
	 * @param string $code
	 * @param string $site_code
	 * @dataProvider data_code_site_code
	 */
	public function test_handle_action_exchange_site_code( $code, $site_code ) {
		$user_id = $this->factory()->user->create( array( 'role' => 'administrator' ) );
		wp_set_current_user( $user_id );
		$context        = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE, new MutableInput() );
		$authentication = new Authentication( $context );
		$setup          = new Setup( $context, new User_Options( $context ), $authentication );
		$setup->register();

		$_GET['googlesitekit_code']      = $code;
		$_GET['googlesitekit_site_code'] = $site_code;
		$_GET['nonce']                   = wp_create_nonce( Google_Proxy::NONCE_ACTION );
		$_GET['step']                    = 'test-step';

		$http_requests = array();
		$this->subscribe_to_wp_http_requests(
			function ( $url, $args ) use ( &$http_requests ) {
				$http_requests[ $url ] = $args;
			}
		);
		$sync_url = ( new Google_Proxy( $context ) )->url( Google_Proxy::OAUTH2_SITE_URI );

		// Stub the response to the proxy oauth API.
		$this->stub_oauth2_site_request( $code, $site_code );

		$this->assertFalse( $authentication->credentials()->has() );

		try {
			do_action( 'admin_action_' . Google_Proxy::ACTION_EXCHANGE_SITE_CODE );
			$this->fail( 'Expected redirection to proxy setup URL!' );
		} catch ( WPDieException $exception ) {
			$this->assertContains(
				'Invalid request',
				$exception->getMessage()
			);
			$no_code      = empty( $code );
			$no_site_code = empty( $site_code );
			// Ensure one or both were missing.
			$this->assertTrue( $no_code ?: $no_site_code );
		} catch ( RedirectException $redirect ) {
			$location = $redirect->get_location();
			$this->assertStringStartsWith( 'https://sitekit.withgoogle.com/site-management/setup/', $location );
			$this->assertContains( '&step=test-step', $location );
			$this->assertArrayHasKey( $sync_url, $http_requests );
			$sync_request = $http_requests[ $sync_url ];
			$this->assertEquals( $code, $sync_request['body']['code'] );
			$this->assertEquals( $site_code, $sync_request['body']['site_code'] );
			$this->assertTrue( $authentication->credentials()->has() );
		}
	}

	public function data_code_site_code() {
		return array(
			'code + site_code' => array(
				'test-code',
				'test-site-code',
			),
			'code only'        => array(
				'test-code',
				'',
			),
			'neither code'     => array(
				'',
				'',
			),
		);
	}

	/**
	 * @param $code
	 * @param $site_code
	 */
	public function stub_oauth2_site_request( $code, $site_code ) {
		add_filter(
			'pre_http_request',
			function ( $preempt, $args, $url ) use ( $code, $site_code ) {
				if ( false === strpos( $url, Google_Proxy::OAUTH2_SITE_URI ) ) {
					return $preempt;
				}
				// Fail the request if no code or site_code were given.
				if ( empty( $args['body']['code'] ) || empty( $args['body']['site_code'] ) ) {
					return array(
						'headers'  => array(),
						'response' => array(
							'code'    => 400,
							'message' => get_status_header_desc( 400 ),
						),
						'body'     => '',
					);
				}

				list( $site_id, $site_secret ) = $this->get_fake_proxy_credentials();

				return array(
					'headers'       => array(),
					'body'          => json_encode(
						compact( 'site_id', 'site_secret' )
					),
					'response'      => array(
						'code'    => 200,
						'message' => 'OK',
					),
					'cookies'       => array(),
					'http_response' => null,
				);
			},
			10,
			3
		);
	}

}
