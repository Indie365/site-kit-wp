<?php
/**
 * Class Google\Site_Kit\Core\DI\DI_Services_Aware_Trait
 *
 * @package   Google\Site_Kit\Core\DI
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\DI;

/**
 * Trait for DI services aware classes.
 *
 * @since n.e.x.t
 */
trait DI_Entry_Aware_Trait {

	/**
	 * Gets DI entry.
	 *
	 * @since n.e.x.t
	 * @deprecated
	 *
	 * @param string $name Entry name.
	 * @return mixed DI entry on success, otherwise NULL.
	 */
	public function __get( $name ) {
		return $this->get_di_entry( $name );
	}

	/**
	 * Gets DI entry.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $name Entry name.
	 * @return mixed DI entry on success, otherwise NULL.
	 */
	public function get_di_entry( $name ) {
		if ( $this instanceof DI_Aware_Interface ) {
			return $this->get_di()->get( $name );
		}

		return null;
	}

}
