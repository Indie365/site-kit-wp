<?php
/**
 * ModulesTest
 *
 * @package   Google\Site_Kit
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Core\Modules;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Modules\Modules;
use Google\Site_Kit\Core\REST_API\REST_Routes;
use Google\Site_Kit\Modules\AdSense;
use Google\Site_Kit\Modules\Analytics;
use Google\Site_Kit\Modules\Analytics_4;
use Google\Site_Kit\Modules\Idea_Hub;
use Google\Site_Kit\Modules\Optimize;
use Google\Site_Kit\Modules\PageSpeed_Insights;
use Google\Site_Kit\Modules\Search_Console;
use Google\Site_Kit\Modules\Site_Verification;
use Google\Site_Kit\Modules\Subscribe_With_Google;
use Google\Site_Kit\Modules\Tag_Manager;
use Google\Site_Kit\Tests\TestCase;

/**
 * @group Modules
 */
class ModulesTest extends TestCase {

	public function test_get_available_modules() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$available = array_map(
			function ( $instance ) {
				return get_class( $instance );
			},
			$modules->get_available_modules()
		);

		$this->assertEqualSets(
			array(
				'adsense'            => 'Google\\Site_Kit\\Modules\\AdSense',
				'analytics'          => 'Google\\Site_Kit\\Modules\\Analytics',
				'analytics-4'        => 'Google\\Site_Kit\\Modules\\Analytics_4',
				'optimize'           => 'Google\\Site_Kit\\Modules\\Optimize',
				'pagespeed-insights' => 'Google\\Site_Kit\\Modules\\PageSpeed_Insights',
				'search-console'     => 'Google\\Site_Kit\\Modules\\Search_Console',
				'site-verification'  => 'Google\\Site_Kit\\Modules\\Site_Verification',
				'tagmanager'         => 'Google\\Site_Kit\\Modules\\Tag_Manager',
			),
			$available
		);
	}

	public function test_get_active_modules() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$always_on_modules = array(
			'search-console'    => 'Google\\Site_Kit\\Modules\\Search_Console',
			'site-verification' => 'Google\\Site_Kit\\Modules\\Site_Verification',
		);

		$default_active_modules = array(
			'pagespeed-insights' => 'Google\\Site_Kit\\Modules\\PageSpeed_Insights',
		);

		$this->assertEqualSets(
			$always_on_modules + $default_active_modules,
			array_map( 'get_class', $modules->get_active_modules() )
		);

		// Active modules other than always-on modules are stored in an option.

		// Active modules will fallback to legacy option if set.
		update_option( 'googlesitekit-active-modules', array( 'analytics' ) );

		$this->assertEqualSets(
			$always_on_modules + array(
				'analytics'   => 'Google\\Site_Kit\\Modules\\Analytics',
				'analytics-4' => 'Google\\Site_Kit\\Modules\\Analytics_4',
			),
			array_map( 'get_class', $modules->get_active_modules() )
		);

		// If the modern option is set, it will take precedence over legacy (set or not).
		update_option( Modules::OPTION_ACTIVE_MODULES, array( 'adsense' ) );

		$this->assertEquals(
			$always_on_modules + array(
				'adsense' => 'Google\\Site_Kit\\Modules\\AdSense',
			),
			array_map( 'get_class', $modules->get_active_modules() )
		);
	}

	public function test_register() {
		$modules     = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$fake_module = new FakeModule( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$fake_module->set_force_active( true );
		remove_all_filters( 'googlesitekit_apifetch_preload_paths' );

		$this->force_set_property( $modules, 'modules', array( 'fake-module' => $fake_module ) );

		$this->assertFalse( $fake_module->is_registered() );
		$modules->register();
		$this->assertTrue( $fake_module->is_registered() );

		$this->assertTrue( has_filter( 'googlesitekit_apifetch_preload_paths' ) );
		$this->assertContains(
			'/' . REST_Routes::REST_ROOT . '/core/modules/data/list',
			apply_filters( 'googlesitekit_apifetch_preload_paths', array() )
		);
	}

	public function test_get_module() {
		$modules   = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$available = $modules->get_available_modules();

		$search_console_module = $modules->get_module( 'search-console' );

		$this->assertEquals( $available['search-console'], $search_console_module );
	}

	public function test_get_module_exception() {
		$modules     = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$module_slug = 'non-existent-module';

		$this->assertArrayNotHasKey( $module_slug, $modules->get_available_modules() );

		try {
			$modules->get_module( $module_slug );
		} catch ( \Exception $exception ) {
			// We expect an exception to be thrown, let's make sure it's the right one.
			$this->assertStringContainsString( $module_slug, $exception->getMessage() );

			return;
		}

		$this->fail( 'Failed to catch exception thrown for non-existent module in get_module.' );
	}

	public function test_get_module_dependencies() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertArrayHasKey( 'optimize', $modules->get_available_modules() );
		$dependencies = $modules->get_module_dependencies( 'optimize' );

		$this->assertContains( 'analytics', $dependencies );
	}

	public function test_get_module_dependencies_exception() {
		$modules     = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$module_slug = 'non-existent-module';

		$this->assertArrayNotHasKey( $module_slug, $modules->get_available_modules() );

		try {
			$modules->get_module_dependencies( $module_slug );
		} catch ( \Exception $exception ) {
			// We expect an exception to be thrown, let's make sure it's the right one.
			$this->assertStringContainsString( $module_slug, $exception->getMessage() );

			return;
		}

		$this->fail( 'Failed to catch exception thrown for non-existent module in get_module_dependencies.' );
	}

	public function test_get_module_dependants() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertArrayHasKey( 'analytics', $modules->get_available_modules() );
		$dependants = $modules->get_module_dependants( 'analytics' );

		$this->assertContains( 'optimize', $dependants );
	}

	public function test_get_module_dependants_exception() {
		$modules     = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$module_slug = 'non-existent-module';

		$this->assertArrayNotHasKey( $module_slug, $modules->get_available_modules() );

		try {
			$modules->get_module_dependants( $module_slug );
		} catch ( \Exception $exception ) {
			// We expect an exception to be thrown, let's make sure it's the right one.
			$this->assertStringContainsString( $module_slug, $exception->getMessage() );

			return;
		}

		$this->fail( 'Failed to catch exception thrown for non-existent module in get_module_dependants.' );
	}

	public function test_is_module_active() {
		$modules     = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$fake_module = new FakeModule( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		delete_option( Modules::OPTION_ACTIVE_MODULES );

		$this->force_set_property( $modules, 'modules', array( 'fake-module' => $fake_module ) );

		// Modules can be active by presence in active modules option
		$this->assertFalse( $modules->is_module_active( 'fake-module' ) );
		update_option( Modules::OPTION_ACTIVE_MODULES, array( 'fake-module' ) );
		$this->assertTrue( $modules->is_module_active( 'fake-module' ) );

		delete_option( Modules::OPTION_ACTIVE_MODULES );

		// Some modules are always active
		$this->assertFalse( $modules->is_module_active( 'fake-module' ) );
		$fake_module->set_force_active( true );
		$this->assertTrue( $modules->is_module_active( 'fake-module' ) );
	}

	public function test_is_module_connected() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$valid_module_slug = 'search-console';
		$this->assertArrayHasKey( $valid_module_slug, $modules->get_available_modules() );
		$this->assertTrue( $modules->is_module_connected( $valid_module_slug ) );

		$non_existent_module_slug = 'non-existent-module';
		$this->assertArrayNotHasKey( $non_existent_module_slug, $modules->get_available_modules() );
		$this->assertFalse( $modules->is_module_connected( $non_existent_module_slug ) );
	}

	public function test_activate_module() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		// Attempting to activate a non-existent module returns false
		$this->assertArrayNotHasKey( 'fake-module', $modules->get_available_modules() );
		$this->assertFalse( $modules->activate_module( 'fake-module' ) );

		$activation_invocations = 0;
		$fake_module            = new FakeModule( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$fake_module->set_on_activation_callback(
			function () use ( &$activation_invocations ) {
				$activation_invocations++;
			}
		);

		$this->force_set_property( $modules, 'modules', array( 'fake-module' => $fake_module ) );

		$this->assertNotContains( 'fake-module', get_option( Modules::OPTION_ACTIVE_MODULES, array() ) );
		$this->assertEquals( 0, $activation_invocations );
		$this->assertTrue( $modules->activate_module( 'fake-module' ) );
		$this->assertEquals( 1, $activation_invocations );
		$this->assertContains( 'fake-module', get_option( Modules::OPTION_ACTIVE_MODULES, array() ) );

		// Subsequent calls to activate an active module do not call the on_activation method
		$this->assertTrue( $modules->activate_module( 'fake-module' ) );
		$this->assertEquals( 1, $activation_invocations );
	}

	public function test_deactivate_module() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		// Attempting to deactivate a non-existent module returns false
		$this->assertArrayNotHasKey( 'fake-module', $modules->get_available_modules() );
		$this->assertFalse( $modules->deactivate_module( 'fake-module' ) );

		$deactivation_invocations = 0;
		$fake_module              = new FakeModule( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$fake_module->set_on_deactivation_callback(
			function () use ( &$deactivation_invocations ) {
				$deactivation_invocations++;
			}
		);

		$this->force_set_property( $modules, 'modules', array( 'fake-module' => $fake_module ) );
		update_option( Modules::OPTION_ACTIVE_MODULES, array( 'fake-module' ) );

		$this->assertContains( 'fake-module', get_option( Modules::OPTION_ACTIVE_MODULES, array() ) );

		// Force-active modules cannot be deactivated
		$fake_module->set_force_active( true );
		$this->assertFalse( $modules->deactivate_module( 'fake-module' ) );
		$this->assertEquals( 0, $deactivation_invocations );
		$this->assertContains( 'fake-module', get_option( Modules::OPTION_ACTIVE_MODULES, array() ) );

		$fake_module->set_force_active( false );
		$this->assertTrue( $modules->deactivate_module( 'fake-module' ) );
		$this->assertEquals( 1, $deactivation_invocations );
		$this->assertNotContains( 'fake-module', get_option( Modules::OPTION_ACTIVE_MODULES, array() ) );

		// Subsequent calls to deactivate an inactive module do not call the on_deactivation method
		$this->assertTrue( $modules->deactivate_module( 'fake-module' ) );
		$this->assertEquals( 1, $deactivation_invocations );
	}

	public function test_analytics_connects_using_analytics_configuration() {
		remove_all_actions( 'googlesitekit_authorize_user' );

		$context = new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE );
		$modules = new Modules( $context );
		$modules->register();

		$this->assertNotContains( 'analytics', $modules->get_active_modules() );

		do_action(
			'googlesitekit_authorize_user',
			array(
				'analytics_configuration' => array(),
			)
		);

		// Check that we don't activate the Analytics module if the analytics_configuration is not passed.
		$this->assertNotContains(
			'analytics',
			array_keys( $modules->get_active_modules() )
		);

		do_action(
			'googlesitekit_authorize_user',
			array(
				'analytics_configuration' => array(
					'ga_account_id'               => '12345678',
					'ua_property_id'              => 'UA-12345678-1',
					'ua_internal_web_property_id' => '13579',
					'ua_profile_id'               => '987654',
				),
			)
		);

		// The Analytics module should be activated now.
		$this->assertContains(
			'analytics',
			array_keys( $modules->get_active_modules() )
		);
	}

	/**
	 * @dataProvider provider_googlesitekit_available_modules_filter
	 *
	 * @param callable      $filter   The filter to be applied at `googlesitekit_available_modules`
	 * @param array<string> $expected An array with the keys of the expected modules
	 */
	public function test_googlesitekit_available_modules_filter( callable $filter, $expected ) {
		add_filter( 'googlesitekit_available_modules', $filter );

		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertCount( count( $expected ), array_keys( $modules->get_available_modules() ) );

		foreach ( $expected as $module_slug ) {
			$this->assertArrayHasKey( $module_slug, $modules->get_available_modules() );
		}
	}

	public function provider_googlesitekit_available_modules_filter() {
		$default_modules = array(
			Site_Verification::MODULE_SLUG,
			Search_Console::MODULE_SLUG,
			AdSense::MODULE_SLUG,
			Analytics::MODULE_SLUG,
			Analytics_4::MODULE_SLUG,
			PageSpeed_Insights::MODULE_SLUG,
			Optimize::MODULE_SLUG,
			Tag_Manager::MODULE_SLUG,
		);

		yield 'should return all the modules if filter does not change the modules keys' => array(
			function ( $modules ) {
				return $modules;
			},
			$default_modules,
		);

		yield 'should remove all the modules from the register, except the ones flagged as force active' => array(
			function ( $modules ) {
				return array();
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield 'should remove all module if `false` is used on the filter, except the ones flagged as force active' => array(
			function ( $modules ) {
				return false;
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield 'should remove all module if `null` is used on the filter, except the ones flagged as force active' => array(
			function ( $modules ) {
				return null;
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield 'should remove all module if `0` is used on the filter,  except the ones flagged as force active' => array(
			function ( $modules ) {
				return 0;
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield "should remove all module if `''` is used on the filter,  except the ones flagged as force active" => array(
			function ( $modules ) {
				return '';
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield 'should enable only analytics, search console and forced active modules' => array(
			function ( $modules ) {
				return array( Analytics::MODULE_SLUG, Search_Console::MODULE_SLUG );
			},
			array( Site_Verification::MODULE_SLUG, Analytics::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);

		yield 'should ignore non existing modules, and include modules flagged as forced active' => array(
			function ( $modules ) {
				return array( 'apollo-landing', 'orbital-phase' );
			},
			array( Site_Verification::MODULE_SLUG, Search_Console::MODULE_SLUG ),
		);
	}

	/**
	 * @dataProvider provider_feature_flag_modules
	 *
	 * @param string        $feature_flag    The name of the feature flag we are switching.
	 * @param bool          $feature_enabled Wether the flag should be enabled or disabled using
	 *                                       `googlesitekit_is_feature_enabled`
	 * @param string        $module_slug     The slug of the module we are forcing via
	 *                                       `googlesitekit_available_modules`
	 * @param array<string> $expected        The array of expected module slugs.
	 */
	public function test_feature_flag_enabled_modules( $feature_flag, $feature_enabled, $module_slug, array $expected ) {
		add_filter(
			'googlesitekit_is_feature_enabled',
			function ( $is_enabled, $feature ) use ( $feature_flag, $feature_enabled ) {
				if ( $feature === $feature_flag ) {
					return $feature_enabled;
				}

				return $is_enabled;
			},
			10,
			2
		);

		add_filter(
			'googlesitekit_available_modules',
			function ( $modules ) use ( $module_slug ) {
				$modules[] = $module_slug;

				return $modules;
			}
		);

		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertCount( count( $expected ), array_keys( $modules->get_available_modules() ) );
		foreach ( $expected as $slug ) {
			$this->assertArrayHasKey( $slug, $modules->get_available_modules() );
		}
	}

	public function provider_feature_flag_modules() {
		$default_modules = array(
			Site_Verification::MODULE_SLUG,
			Search_Console::MODULE_SLUG,
			AdSense::MODULE_SLUG,
			Analytics::MODULE_SLUG,
			Analytics_4::MODULE_SLUG,
			PageSpeed_Insights::MODULE_SLUG,
			Optimize::MODULE_SLUG,
			Tag_Manager::MODULE_SLUG,
		);

		yield 'should include the `idea-hub` module when enabled' => array(
			// Module feature flag.
			'ideaHubModule',
			// Module enabled or disabled
			true,
			Idea_Hub::MODULE_SLUG,
			// Expected
			array_merge( $default_modules, array( Idea_Hub::MODULE_SLUG ) ),
		);

		yield 'should not include the `idea-hub` module when enabled' => array(
			// Module feature flag.
			'ideaHubModule',
			// Module enabled or disabled
			false,
			Idea_Hub::MODULE_SLUG,
			// Expected
			$default_modules,
		);

		yield 'should include the `subscribe-with-google` module when enabled' => array(
			// Module feature flag.
			'swgModule',
			// Module enabled or disabled
			true,
			Subscribe_With_Google::MODULE_SLUG,
			// Expected
			array_merge( $default_modules, array( Subscribe_With_Google::MODULE_SLUG ) ),
		);

		yield 'should not include the `subscribe-with-google` module when enabled' => array(
			// Module feature flag.
			'swgModule',
			// Module enabled or disabled
			false,
			Subscribe_With_Google::MODULE_SLUG,
			// Expected
			$default_modules,
		);
	}

	public function test_get_shareable_modules() {
		$modules = new Modules( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->enable_feature( 'dashboardSharing' );

		$shareable_active_modules = array_map( 'get_class', $modules->get_shareable_modules() );

		$this->assertEqualSets(
			array(
				'search-console'     => 'Google\\Site_Kit\\Modules\\Search_Console',
				'pagespeed-insights' => 'Google\\Site_Kit\\Modules\\PageSpeed_Insights',
			),
			$shareable_active_modules
		);
	}
}
