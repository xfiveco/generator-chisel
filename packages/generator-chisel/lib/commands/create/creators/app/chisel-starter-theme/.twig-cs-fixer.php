<?php

$finder = new TwigCsFixer\File\Finder();
$finder->exclude('acf-json');
$finder->exclude('classes');
$finder->exclude('dist');
$finder->exclude('vendor');

$config = new TwigCsFixer\Config\Config();
$config->setCacheFile(null);
$config->setFinder($finder);

return $config;
