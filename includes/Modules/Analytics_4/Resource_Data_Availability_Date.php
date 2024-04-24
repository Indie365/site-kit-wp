<?php
/**
 * Class Google\Site_Kit\Modules\Analytics_4\Resource_Data_Availability_Date
 *
 * @package   Google\Site_Kit\Modules\Analytics_4
 * @copyright 2024 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Modules\Analytics_4;

use Google\Site_Kit\Core\Modules\Module_Settings;
use Google\Site_Kit\Core\Storage\Transients;

/**
 * Class for managing Analytics 4 resource data availability date.
 *
 * @since n.e.x.t
 * @access private
 * @ignore
 */
class Resource_Data_Availability_Date {

	/**
	 * List of valid custom dimension slugs.
	 *
	 * @since n.e.x.t
	 * @var array
	 */
	const CUSTOM_DIMENSION_SLUGS = array(
		'googlesitekit_post_type',
	);

	const RESOURCE_TYPE_AUDIENCE         = 'audience';
	const RESOURCE_TYPE_CUSTOM_DIMENSION = 'customDimension';
	const RESOURCE_TYPE_PROPERTY         = 'property';

	/**
	 * Transients instance.
	 *
	 * @since n.e.x.t
	 * @var Transients
	 */
	protected $transients;

	/**
	 * Module settings.
	 *
	 * @since n.e.x.t
	 * @var Module_Settings
	 */
	protected $settings;

	/**
	 * Constructor.
	 *
	 * @since n.e.x.t
	 *
	 * @param Transients      $transients Transients instance.
	 * @param Module_Settings $settings Module settings instance.
	 */
	public function __construct( Transients $transients, Module_Settings $settings ) {
		$this->transients = $transients;
		$this->settings   = $settings;
	}

	/**
	 * Gets data available date transient name for the given resource.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_slug Resource slug.
	 * @param string $resource_type Resource type.
	 * @return string Data available date transient name.
	 */
	protected function get_resource_transient_name( $resource_slug, $resource_type ) {
		return "googlesitekit_{$resource_type}_{$resource_slug}_data_availability_date";
	}

	/**
	 * Gets data availability dates for all resources.
	 *
	 * @since n.e.x.t
	 *
	 * @return array Associative array of resource names and their data availability state.
	 */
	public function get_resource_dates() {
		$property_id         = $this->get_property_id();
		$available_audiences = $this->get_available_audience_resource_names();

		return array(
			self::RESOURCE_TYPE_AUDIENCE         => array_reduce(
				$available_audiences,
				function ( $data_availability, $audience ) {
					$data_availability[ $audience ] = $this->get_resource_date( $audience, self::RESOURCE_TYPE_AUDIENCE );
					return $data_availability;
				},
				array()
			),
			self::RESOURCE_TYPE_CUSTOM_DIMENSION => array_reduce(
				self::CUSTOM_DIMENSION_SLUGS,
				function ( $data_availability, $custom_dimension ) {
					$data_availability[ $custom_dimension ] = $this->get_resource_date( $custom_dimension, self::RESOURCE_TYPE_CUSTOM_DIMENSION );
					return $data_availability;
				},
				array()
			),
			self::RESOURCE_TYPE_PROPERTY         => array(
				$property_id => $this->get_resource_date(
					$property_id,
					self::RESOURCE_TYPE_PROPERTY
				),
			),
		);
	}

	/**
	 * Returns the data availability date for the given resource.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_slug Resource slug.
	 * @param string $resource_type Resource type.
	 * @return string|false Data availability date on success, false otherwise.
	 */
	public function get_resource_date( $resource_slug, $resource_type ) {
		return (int) $this->transients->get( $this->get_resource_transient_name( $resource_slug, $resource_type ) );
	}

	/**
	 * Sets the data availability date for the given resource.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_slug Resource slug.
	 * @param string $resource_type Resource type.
	 * @param int    $date Data availability date.
	 * @return bool True on success, false otherwise.
	 */
	public function set_resource_date( $resource_slug, $resource_type, $date ) {
		return $this->transients->set( $this->get_resource_transient_name( $resource_slug, $resource_type ), $date );
	}

	/**
	 * Resets the data availability date for given resource.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_slug Resource slug.
	 * @param string $resource_type Resource type.
	 * @return bool True on success, false otherwise.
	 */
	public function reset_resource_date( $resource_slug, $resource_type ) {
		return $this->transients->delete( $this->get_resource_transient_name( $resource_slug, $resource_type ) );
	}

	/**
	 * Resets the data availability date for all resources.
	 *
	 * @since n.e.x.t
	 */
	public function reset_all_resource_dates() {

		foreach ( self::CUSTOM_DIMENSION_SLUGS as $custom_dimension ) {
			$this->reset_resource_date( $custom_dimension, self::RESOURCE_TYPE_CUSTOM_DIMENSION );
		}

		$available_audiences = $this->get_available_audience_resource_names();

		foreach ( $available_audiences as $audience_slug ) {
			$this->reset_resource_date( $audience_slug, self::RESOURCE_TYPE_AUDIENCE );
		}

		$this->reset_resource_date( $this->get_property_id(), self::RESOURCE_TYPE_PROPERTY );
	}

	/**
	 * Checks whether the given resource type is valid.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_type Resource type.
	 * @return bool True if valid, false otherwise.
	 */
	public function is_valid_resource_type( $resource_type ) {
		return in_array( $resource_type, array( self::RESOURCE_TYPE_AUDIENCE, self::RESOURCE_TYPE_CUSTOM_DIMENSION, self::RESOURCE_TYPE_PROPERTY ), true );
	}

	/**
	 * Checks whether the given resource slug is valid.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $resource_slug Resource slug.
	 * @param string $resource_type Resource type.
	 * @return bool True if valid, false otherwise.
	 */
	public function is_valid_resource_slug( $resource_slug, $resource_type ) {
		switch ( $resource_type ) {
			case self::RESOURCE_TYPE_AUDIENCE:
				return in_array( $resource_slug, $this->get_available_audience_resource_names(), true );
			case self::RESOURCE_TYPE_CUSTOM_DIMENSION:
				return in_array( $resource_slug, self::CUSTOM_DIMENSION_SLUGS, true );
			case self::RESOURCE_TYPE_PROPERTY:
				return $resource_slug === $this->get_property_id();
			default:
				return false;
		}
	}

	/**
	 * Gets available audience resource names.
	 *
	 * @since n.e.x.t
	 *
	 * @return array List of available audience resource names.
	 */
	private function get_available_audience_resource_names() {
		$settings            = $this->settings->get();
		$available_audiences = $settings['availableAudiences'] ?? array();

		return array_map(
			function ( $audience ) {
				return $audience['name'];
			},
			$available_audiences
		);
	}

	/**
	 * Gets the property ID from settings instance.
	 *
	 * @since n.e.x.t
	 *
	 * @return string Property ID.
	 */
	private function get_property_id() {
		return $this->settings->get()['propertyID'];
	}
}
