<?php
/**
 * Migration for 1.119.0
 *
 * @package   Google\Site_Kit\Core\Util
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\Util;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Permissions\Permissions;
use Google\Site_Kit\Core\Storage\Options;
use Google\Site_Kit\Core\Storage\User_Options;
use Google\Site_Kit\Modules\Analytics_4\Settings as Analytics_Settings;

/**
 * Class Migration_1_119_0
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Migration_1_119_0 {
	/**
	 * Target DB version.
	 */
	const DB_VERSION = '1.119.0';

	/**
	 * Context instance.
	 *
	 * @since n.e.x.t
	 * @var Context
	 */
	protected $context;

	/**
	 * Options instance.
	 *
	 * @since n.e.x.t
	 * @var Options
	 */
	protected $options;

	/**
	 * User_Options instance.
	 *
	 * @since n.e.x.t
	 * @var User_Options
	 */
	protected $user_options;

	/**
	 * Analytics_Settings instance.
	 *
	 * @since n.e.x.t
	 * @var Analytics_Settings
	 */
	protected $analytics_settings;

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @param Context      $context      Plugin context instance.
	 * @param Options      $options      Optional. Options instance.
	 * @param User_Options $user_options Optional. User_Options instance.
	 */
	public function __construct(
		Context $context,
		Options $options = null,
		User_Options $user_options = null
	) {
		$this->context            = $context;
		$this->options            = $options ?: new Options( $context );
		$this->user_options       = $user_options ?: new User_Options( $context );
		$this->analytics_settings = new Analytics_Settings( $this->options );
	}

	/**
	 * Registers hooks.
	 *
	 * @since n.e.x.t
	 */
	public function register() {
		add_action( 'admin_init', array( $this, 'migrate' ) );
	}

	/**
	 * Migrates the DB.
	 *
	 * @since n.e.x.t
	 */
	public function migrate() {
		$db_version = $this->options->get( 'googlesitekit_db_version' );

		if ( ! $db_version || version_compare( $db_version, self::DB_VERSION, '<' ) ) {
			$analytics_settings = $this->analytics_settings->get();

			if ( empty( $analytics_settings ) || ! empty( $analytics_settings ) && ! isset( $analytics_settings['ownerID'] ) ) {
				return;
			}

			$owner_id         = (int) $analytics_settings['ownerID'];
			$property_id      = $analytics_settings['propertyID'];
			$webdatastream_id = $analytics_settings['webDataStreamID'];
			$restore_user     = $this->user_options->switch_user( $owner_id );

			// If the module owner has correct permission, and Analytics 4 module
			// has property id and web data stream id, migration can be initiated.
			if ( user_can( $owner_id, Permissions::VIEW_AUTHENTICATED_DASHBOARD ) && $property_id && $webdatastream_id ) {
				$this->migrate_legacy_settings();

				$this->options->set( 'googlesitekit_db_version', self::DB_VERSION );
			}

			$restore_user();
		}
	}

	/**
	 * Migrates the legacy analytics settings over to the analytics 4 settings.
	 *
	 * @since n.e.x.t
	 */
	protected function migrate_legacy_settings() {
		$legacy_settings    = $this->options->get( 'googlesitekit_analytics_settings' );
		$options_to_migrate = array();

		$migrate_option_keys = array(
			'accountID',
			'adsConversionID',
			'canUseSnippet',
			'trackingDisabled',
		);

		array_walk(
			$migrate_option_keys,
			function( $setting ) use ( &$options_to_migrate, $legacy_settings ) {
				$options_to_migrate[ $setting ] = $legacy_settings[ $setting ];
			}
		);

		if ( ! empty( $options_to_migrate ) ) {
			$this->analytics_settings->merge(
				$options_to_migrate
			);
		}
	}
}
