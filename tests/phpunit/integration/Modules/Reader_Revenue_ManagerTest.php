<?php
/**
 * Reader_Revenue_ManagerTest
 *
 * @package   Google\Site_Kit\Tests\Modules
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Modules;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Authentication\Authentication;
use Google\Site_Kit\Modules\Reader_Revenue_Manager;
use Google\Site_Kit\Tests\TestCase;
use Google\Site_Kit\Tests\FakeHttp;
use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Core\Storage\Options;
use Google\Site_Kit_Dependencies\GuzzleHttp\Psr7\Request;
use Google\Site_Kit_Dependencies\GuzzleHttp\Psr7\Response;
use Google\Site_Kit\Tests\Core\Modules\Module_With_Service_Entity_ContractTests;
use Google\Site_Kit_Dependencies\Google\Service\SubscribewithGoogle as Google_Service_SubscribewithGoogle;

/**
 * @group Modules
 * @group Reader_Revenue_Manager
 */
class Reader_Revenue_ManagerTest extends TestCase {

	use Module_With_Service_Entity_ContractTests;

	/**
	 * Context instance.
	 *
	 * @var Context
	 */
	private $context;

	/**
	 * Authentication object.
	 *
	 * @var Authentication
	 */
	private $authentication;

	/**
	 * Reader_Revenue_Manager object.
	 *
	 * @var Reader_Revenue_Manager
	 */
	private $reader_revenue_manager;

	public function set_up() {
		parent::set_up();

		$this->context                = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE );
		$options                      = new Options( $this->context );
		$user                         = $this->factory()->user->create_and_get( array( 'role' => 'administrator' ) );
		$user_options                 = new User_Options( $this->context, $user->ID );
		$this->authentication         = new Authentication( $this->context, $options, $user_options );
		$this->reader_revenue_manager = new Reader_Revenue_Manager( $this->context, $options, $user_options, $this->authentication );

		$this->enable_feature( 'rrmModule' );
	}

	public function test_register() {
		remove_all_filters( 'googlesitekit_auth_scopes' );

		$this->reader_revenue_manager->register();

		$this->assertEquals(
			$this->reader_revenue_manager->get_scopes(),
			apply_filters( 'googlesitekit_auth_scopes', array() )
		);
	}

	public function test_magic_methods() {
		$this->assertEquals( 'reader-revenue-manager', $this->reader_revenue_manager->slug );
		$this->assertEquals( 'Reader Revenue Manager', $this->reader_revenue_manager->name );
		$this->assertEquals( 'https://readerrevenue.withgoogle.com/', $this->reader_revenue_manager->homepage );
		$this->assertEquals( 'Reader Revenue Manager helps publishers grow, retain, and engage their audiences, creating new revenue opportunities', $this->reader_revenue_manager->description );
		$this->assertEquals( 5, $this->reader_revenue_manager->order );
	}

	public function test_get_scopes() {
		$this->assertEqualSets(
			array(
				'https://www.googleapis.com/auth/subscribewithgoogle.publications.readonly',
			),
			$this->reader_revenue_manager->get_scopes()
		);
	}

	public function test_service_classes_exist() {
		$this->assertTrue(
			class_exists( 'Google\Site_Kit_Dependencies\Google\Service\SubscribewithGoogle' )
		);
	}

	public function test_get_datapoints() {
		$this->assertEqualSets(
			array(
				'publications',
			),
			$this->reader_revenue_manager->get_datapoints()
		);
	}

	public function test_get_publications() {
		FakeHttp::fake_google_http_handler(
			$this->reader_revenue_manager->get_client(),
			function ( Request $request ) {
				$url = parse_url( $request->getUri() );

				switch ( $url['path'] ) {
					case '/v1/publications':
						return new Response( 200 );
				}
			}
		);

		$this->reader_revenue_manager->register();

		$this->authentication->get_oauth_client()->set_granted_scopes(
			$this->authentication->get_oauth_client()->get_required_scopes()
		);

		$data = $this->reader_revenue_manager->get_data( 'publications' );
		$this->assertNotWPError( $data );
		$this->assertIsArray( $data );
	}

	/**
	 * @return Reader_Revenue_Manager
	 */
	protected function get_module_with_service_entity() {
		return $this->reader_revenue_manager;
	}
}
