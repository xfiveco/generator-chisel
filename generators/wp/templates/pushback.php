<?php

$configFileName = 'pushback-config.json';
$configFilePath = './' . $configFileName;

$context = array(
    'POST' => $_POST,
    'GIT' => array(
      'commiter' => trim(`git log -1 --pretty=%cn`),
      'email' => trim(`git log -1 --pretty=%ce`),
      'message' => trim(`git log -1 --pretty=%B`),
	  'hash' => trim(`git log -1 --pretty=%h`),
	  'branch' => trim(`git rev-parse --abbrev-ref HEAD`),
    ),
    'POSTencoded' => json_encode($_POST),
);

$context['GITencoded'] = json_encode($context['GIT']);

function processJson( $jsonString, $context ) {
    return preg_replace_callback( '#\{([^\s]+)\}#',
        function ( $match ) use ( $context ) {
            $variablePath = preg_split( '#\.#', $match[1] );
            foreach ( $variablePath as $key ) {
                if ( isset( $context[ $key ] ) ) {
                    $context = $context[ $key ];
                } else {
                    return $match[0];
                }
            }

            return $context;
        },
		$jsonString
	);
}

function mapParams( $value, $context ) {
    if ( is_array( $value ) ) {
        return array_map(
            function ( $value ) use ( $context ) {
                return mapParams( $value, $context );
            },
            $value
        );
    }

    return processJson( $value, $context );
}

function makeRequest( $params ) {
    $c = curl_init();
    curl_setopt( $c, CURLOPT_URL, $params['url'] );
    if ( strtolower( $params['method'] ) == 'post' ) {
        curl_setopt( $c, CURLOPT_POST, 1 );
    }
	$cHeaders = array();
	if( array_key_exists( 'headers', $params ) ) {
		foreach ( $params['headers'] as $name => $value ) {
			$cHeaders[] = sprintf( '%s: %s', $name, $value );
		}
	}
    curl_setopt( $c, CURLOPT_HTTPHEADER, $cHeaders );

    curl_setopt( $c, CURLOPT_RETURNTRANSFER, true );
    curl_setopt( $c, CURLOPT_TIMEOUT, 5 );
    curl_setopt( $c, CURLOPT_POSTFIELDS, $params['postData'] );

    // Use this options if you want to skip SLL certificate verification
//    curl_setopt( $c, CURLOPT_SSL_VERIFYPEER, false );
//    curl_setopt( $c, CURLOPT_SSL_VERIFYHOST, false );
    // ---

    $result = curl_exec( $c );

    echo $result;
}

function encodePostData( $request ) {
	$contentType = null;
	if( array_key_exists( 'headers', $request ) ) {
		foreach ( $request['headers'] as $name => $value ) {
			if ( strtolower( $name ) == 'content-type' ) {
				$contentType = $value;
				break;
			}
		}
	}

    if ( strpos( strtolower( $contentType ), 'json' ) !== false ) {
        return json_encode( $request['postData'] );
    }

    return http_build_query( $request['postData'] );
}

function startsWith( $string, $query ) {
	return substr($string, 0, strlen($query)) === $query;
}

if ( ! file_exists( $configFilePath ) ) {
    exit;
}

if( startsWith( $context['GIT']['message'], '[chisel-build]' ) ) {
	exit;
}

$jsonString = file_get_contents( $configFilePath );

$request = mapParams(
    json_decode( $jsonString, true ),
    $context
);

$request['postData'] = encodePostData( $request );

makeRequest( $request );
