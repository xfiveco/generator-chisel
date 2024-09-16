<?php
declare(strict_types=1);

use FriendsOfTwig\Twigcs;

$finder_1 = Twigcs\Finder\TemplateFinder::create()->in( __DIR__ . '/views' );
$finder_2 = Twigcs\Finder\TemplateFinder::create()->in( __DIR__ . '/build/blocks' );
$finder_3 = Twigcs\Finder\TemplateFinder::create()->in( __DIR__ . '/build/blocks-acf' );

return Twigcs\Config\Config::create()
	->addFinder( $finder_1 )
	->addFinder( $finder_2 )
	->addFinder( $finder_3 )
	->setName( 'chisel' )
	->setSeverity( 'warning' )
	->setDisplay( Twigcs\Config\ConfigInterface::DISPLAY_BLOCKING )
	// ->setReporter( 'json' ) phpcs:ignore
	->setRuleSet( Twigcs\Ruleset\Official::class );
