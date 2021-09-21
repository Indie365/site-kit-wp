<?php
/**
 * Class Google\Site_Kit\Core\DI\DI_Container
 *
 * @package   Google\Site_Kit\Core\DI
 * @copyright 2021 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Core\DI;

use ArrayAccess;
use Google\Site_Kit_Dependencies\Psr\Container\ContainerInterface;

/**
 * DI container class.
 *
 * @since n.e.x.t
 */
class DI_Container implements ContainerInterface, ArrayAccess {

	/**
	 * Determines whether services and values can be added or overridden.
	 *
	 * @since n.e.x.t
	 * @var bool
	 */
	protected $sealed = false;

	/**
	 * Definitions list.
	 *
	 * @since n.e.x.t
	 * @var array
	 */
	protected $definitions = array();

	/**
	 * Returns true if the container can return an entry for the given identifier.
	 * Returns false otherwise.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return bool TRUE if the container can return an entry, otherwise FALSE.
	 */
	public function offsetExists( $id ) {
		return $this->has( $id );
	}

	/**
	 * Finds an entry of the container by its identifier and returns it.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return mixed Entry.
	 */
	public function offsetGet( $id ) {
		return $this->get( $id );
	}

	/**
	 * Sets the entry definition.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry.
	 * @param mixed  $entry Entry.
	 */
	public function offsetSet( $id, $entry ) {
		if ( is_callable( $entry ) ) {
			$this->set_service( $id, $entry );
		} else {
			$this->set_value( $id, $entry );
		}
	}

	/**
	 * Removes the entry.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry to remove.
	 */
	public function offsetUnset( $id ) {
		unset( $this->definitions[ $id ] );
	}

	/**
	 * Seals the container.
	 *
	 * @since n.e.x.t
	 */
	public function seal() {
		$this->sealed = true;
	}

	/**
	 * Sets the entry definition.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry.
	 * @param array  $entry Entry definition.
	 * @return bool TRUE if the entry is added, otherwise FALSE.
	 */
	protected function set( $id, array $entry ) {
		if ( $this->sealed ) {
			return false;
		}

		$this->definitions[ $id ] = $entry;

		return true;
	}

	/**
	 * Sets the entry definition.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Entry name.
	 * @param mixed  $value Entry value.
	 * @return bool TRUE if the service is added, otherwise FALSE.
	 */
	public function set_value( $id, $value ) {
		return $this->set(
			$id,
			array(
				'entry' => $value,
			)
		);
	}

	/**
	 * Sets the service definition.
	 *
	 * @since n.e.x.t
	 *
	 * @param string          $id Service name.
	 * @param string|callable $service Service class name or a creator function.
	 * @return bool TRUE if the service is added, otherwise FALSE.
	 */
	public function set_service( $id, $service ) {
		$creator_function = $service;
		if ( ! is_callable( $service ) ) {
			$creator_function = function() use ( $service ) {
				return new $service();
			};
		}

		return $this->set(
			$id,
			array(
				'is_service' => true,
				'entry'      => $creator_function,
			)
		);
	}

	/**
	 * Sets services.
	 *
	 * @since n.e.x.t
	 *
	 * @param array $definitions Service definitions.
	 */
	public function set_services( array $definitions ) {
		foreach ( $definitions as $name => $service ) {
			$this->set_service( $name, $service );
		}
	}

	/**
	 * Sets the entry to be factory.
	 *
	 * @since n.e.x.t
	 *
	 * @param string   $id Identifier of the entry.
	 * @param callable $factory_func Factory function.
	 * @return bool TRUE if the factory is added, otherwise FALSE.
	 */
	public function set_factory( $id, $factory_func ) {
		return $this->set(
			$id,
			array(
				'is_factory' => true,
				'entry'      => $factory_func,
			)
		);
	}

	/**
	 * Instantiates a new instance of an entry and returns it. Sets the DI container as well if the instance implements
	 * the DI_Aware_Interface interface.
	 *
	 * @since n.e.x.t
	 *
	 * @param array $definition Definition metadata.
	 * @return mixed An entry instance or anything else that can be returned by a service creator function.
	 */
	protected function get_instance( array $definition ) {
		$instance = call_user_func( $definition['entry'], $this );

		if ( $instance instanceof DI_Aware_Interface ) {
			$instance->set_di( $this );
		}

		return $instance;
	}

	/**
	 * Finds an entry of the container by its identifier and returns it.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return mixed Entry.
	 */
	public function get( $id ) {
		if ( ! isset( $this->definitions[ $id ] ) ) {
			return null;
		}

		$definition = $this->definitions[ $id ];

		if ( ! empty( $definition['is_factory'] ) ) {
			return $this->get_instance( $definition );
		}

		if ( ! empty( $definition['is_service'] ) ) {
			if ( empty( $definition['instance'] ) ) {
				$this->definitions[ $id ]['instance'] = $this->get_instance( $definition );
			}

			return $this->definitions[ $id ]['instance'];
		}

		return $definition['entry'];
	}

	/**
	 * Returns TRUE if the container can return an entry for the given identifier.
	 * Returns FALSE otherwise.
	 *
	 * @since n.e.x.t
	 *
	 * @param string $id Identifier of the entry to look for.
	 * @return bool TRUE if the container can return an entry, otherwise FALSE.
	 */
	public function has( $id ) {
		return ! empty( $this->definitions[ $id ] );
	}

}
