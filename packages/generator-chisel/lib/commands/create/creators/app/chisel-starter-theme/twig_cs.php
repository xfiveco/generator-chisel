<?php
declare(strict_types=1);

use FriendsOfTwig\Twigcs;

$finder = Twigcs\Finder\TemplateFinder::create()->in( __DIR__ . '/views' );

return Twigcs\Config\Config::create()
	->addFinder( $finder )
	->setName( 'chisel' )
	->setSeverity( 'warning' )
	->setDisplay( Twigcs\Config\ConfigInterface::DISPLAY_BLOCKING )
	// ->setReporter( 'json' ) phpcs:ignore
	->setRuleSet( Twigcs\Ruleset\Official::class );
