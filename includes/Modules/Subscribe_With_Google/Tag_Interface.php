<?php
/**
 * Class Google\Site_Kit\Modules\Subscribe_With_Google\Tag_Interface
 *
 * @package   Google\Site_Kit\Modules\Subscribe_With_Google
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Modules\Subscribe_With_Google;

/**
 * Interface for an Subscribe with Google tag.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
interface Tag_Interface {
	/**
	 * Sets the current home domain.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $domain Domain name.
	 */
	public function set_home_domain( $domain );

	/**
	 * Sets whether or not to anonymize IP addresses.
	 *
	 * @since n.e.x.t
	 *
	 * @param bool $anonymize_ip Whether to anonymize IP addresses or not.
	 */
	public function set_anonymize_ip( $anonymize_ip );

	/**
	 * Sets the ads conversion ID.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $ads_conversion_id Ads ID.
	 */
	public function set_ads_conversion_id( $ads_conversion_id );
}
