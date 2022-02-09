<?php
/**
 * Polyfill autoloader.
 *
 * @package   Google\Site_Kit\Tests\Polyfill
 * @copyright 2022 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Polyfill;

use ReflectionClass;
use ReflectionException;

spl_autoload_register(
	function ( $class_name ) {
		switch ( $class_name ) {
			case WP_UnitTestCase_Polyfill::class:
				try {
					$reflection_class = new ReflectionClass( 'WP_UnitTestCase' );

					if ( $reflection_class->hasMethod( 'set_up' ) ) {
						require_once __DIR__ . '/src/WP_UnitTestCase_Passthru.php';
					} else {
						require_once __DIR__ . '/src/WP_UnitTestCase_Polyfill.php';
					}

					return true;
				} catch ( ReflectionException $exception ) {
					return false;
				}
		}

		return false;
	}
);
