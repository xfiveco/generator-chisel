<?php

namespace Chisel\Extensions;

/**
 * Class Twig
 * Use this class to extend twig functionality
 * @package Chisel\Extensions
 */
class Twig implements ChiselExtension {
	public function extend() {
		add_filter( 'timber/loader/twig', array( $this, 'extendTwig' ) );
	}

	/**
	 * Extends Twig, registers filters and functions.
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	public function extendTwig( $twig ) {
		$twig = $this->registerTwigFilters( $twig );
		$twig = $this->registerTwigFunctions( $twig );
		$twig = $this->registerTwigTests( $twig );

		return $twig;
	}

	/**
	 * You can add you own functions to twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigFunctions( $twig ) {
//		$this->registerFunction(
//			$twig,
//			'functionName',
//			array(
//				'\Chisel\Extensions\Twig',
//				'function_callback'
//			)
//		);

		return $twig;
	}

	/**
	 * You can add your own filters to Twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigFilters( $twig ) {
//		$this->registerFilter(
//			$twig,
//			'filterName',
//			array(
//				'\Chisel\Extensions\Twig',
//				'filter_callback'
//			)
//		);

		return $twig;
	}

	/**
	 * You can add your own tests to Twig here
	 *
	 * @param \Twig_Environment $twig
	 *
	 * @return \Twig_Environment $twig
	 */
	protected function registerTwigTests( $twig ) {
//		$this->registerTest(
//			$twig,
//			'testName',
//			array(
//				'\Chisel\Extensions\Twig',
//				'test_callback'
//			)
//		);

		return $twig;
	}

	/**
	 * Use this method to register new Twig function.
	 * This method must not be changed.
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	protected function registerFunction( $twig, $name, $callback = null ) {
		if ( ! $callback ) {
			$callback = array( $this, $name );
		}
		$classNameFunction = new \Twig_SimpleFunction( $name, $callback );
		$twig->addFunction( $classNameFunction );
	}

	/**
	 * Use this method to register new Twig filter.
	 * This method must not be changed.
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	protected function registerFilter( $twig, $name, $callback = null ) {
		if ( ! $callback ) {
			$callback = array( $this, $name );
		}
		$classNameFilter = new \Twig_SimpleFilter( $name, $callback );
		$twig->addFilter( $classNameFilter );
	}

	/**
	 * Use this method to register new Twig test.
	 * This method must not be changed.
	 *
	 * @param \Twig_Environment $twig
	 * @param $name
	 * @param $callback
	 */
	protected function registerTest( $twig, $name, $callback = null ) {
		if ( ! $callback ) {
			$callback = array( $this, $name );
		}
		$classNameTest = new \Twig_SimpleTest( $name, $callback );
		$twig->addTest( $classNameTest );
	}
}
