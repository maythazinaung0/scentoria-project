<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://scentoria-project.onrender.com', // replace with your real Static Site URL
        'http://localhost:3000', // keep for local dev
        'http://localhost:5173', // Vite's local dev server default port, if used
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];