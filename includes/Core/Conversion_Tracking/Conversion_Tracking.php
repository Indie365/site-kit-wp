<?php
/**
 * Class Google\Site_Kit\Core\Conversion_Tracking
 *
 * @package   Google\Site_Kit\Core\Modules
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\Conversion_Tracking;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Conversion_Tracking\Conversion_Event_Providers\WooCommerce;
use LogicException;

/**
 * Class for managing conversion tracking.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Conversion_Tracking {

	/**
	 * Context object.
	 *
	 * @var Context
	 */
	private $context;

	/**
	 * Supported conversion event providers.
	 *
	 * @since n.e.x.t
	 * @var array
	 */
	public static $providers = array(
		WooCommerce::CONVERSION_EVENT_PROVIDER_SLUG => WooCommerce::class,
	);

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @param Context $context Plugin context.
	 */
	public function __construct( Context $context ) {
		$this->context = $context;
	}

	/**
	 * Registers the class functionality.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_action(
			'wp_enqueue_scripts',
			function() {
				$active_providers = $this->get_active_providers();

				array_walk(
					$active_providers,
					function( Conversion_Events_Provider $active_provider ) {
						$script_asset = $active_provider->register_script();
						$script_asset->enqueue();
					}
				);
			}
		);
	}

	/**
	 * Gets the instances of active conversion event providers.
	 *
	 * @since n.e.x.t
	 *
	 * @return array List of active Conversion_Events_Provider instances.
	 * @throws LogicException Thrown if an invalid conversion event provider class name is provided.
	 */
	public function get_active_providers() {
		$active_providers = array();

		foreach ( self::$providers as $provider_slug => $provider_class ) {
			if ( ! is_string( $provider_class ) || ! $provider_class ) {
				throw new LogicException(
					sprintf(
						/* translators: %s: provider slug */
						__( 'A conversion event provider class name is required to instantiate a provider: %s', 'google-site-kit' ),
						$provider_slug
					)
				);
			}

			if ( ! class_exists( $provider_class ) ) {
				throw new LogicException(
					sprintf(
						/* translators: %s: provider classname */
						__( "The '%s' class does not exist", 'google-site-kit' ),
						$provider_class
					)
				);
			}

			if ( ! is_subclass_of( $provider_class, Conversion_Events_Provider::class ) ) {
				throw new LogicException(
					sprintf(
						/* translators: 1: provider classname 2: Conversion_Events_Provider classname */
						__( "The '%1\$s' class must extend the base conversion event provider class: %2\$s", 'google-site-kit' ),
						$provider_class,
						Conversion_Events_Provider::class
					)
				);
			}

			$instance = new $provider_class( $this->context );

			if ( $instance->is_active() ) {
				$active_providers[ $provider_slug ] = $instance;
			}
		}

		return $active_providers;
	}
}
