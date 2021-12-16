<?php
/**
 * Class Google\Site_Kit\Core\Authentication\Previous_Connected_Proxy_URLTest
 *
 * @package   Google\Site_Kit
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Core\Authentication;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Authentication\Previous_Connected_Proxy_URL;
use Google\Site_Kit\Core\Authentication\Connected_Proxy_URL;
use Google\Site_Kit\Core\Storage\Options;
use Google\Site_Kit\Tests\Modules\SettingsTestCase;

/**
 * Previous_Connected_Proxy_URLTest
 *
 * @group Authentication
 */
class Previous_Connected_Proxy_URLTest extends SettingsTestCase {

	/**
	 * Options object.
	 *
	 * @var Options
	 */
	private $options;

	public function setUp() {
		parent::setUp();
		$this->options = new Options( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
	}

	public function test_matches_url() {
		$connected_proxy_url = new Connected_Proxy_URL( $this->options );
		$connected_proxy_url->register();
		$previously_connected_proxy_url = new Previous_Connected_Proxy_URL( $this->options );
		$previously_connected_proxy_url->register();
		$connected_proxy_url->set( 'https://previous.com' );
		$connected_proxy_url->set( 'https://current.com' );
		$this->assertTrue( $connected_proxy_url->matches_url( 'https://current.com/' ) );
		$this->assertTrue( $previously_connected_proxy_url->matches_url( 'https://previous.com/' ) );

	}

	/**
	 * @inheritDoc
	 */
	protected function get_option_name() {
		return Previous_Connected_Proxy_URL::OPTION;
	}

}
