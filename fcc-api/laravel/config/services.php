<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Stripe, Mailgun, SparkPost and others. This file provides a sane
    | default location for this type of information, allowing packages
    | to have a conventional place to find your various credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
    ],

    'ses' => [
        'key' => env('SES_KEY'),
        'secret' => env('SES_SECRET'),
        'region' => 'us-east-1',
    ],

    'sparkpost' => [
        'secret' => env('SPARKPOST_SECRET'),
    ],

    'stripe' => [
        'model' => App\User::class,
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
    ],
    'paypal' => [
        'client_id' => 'AfcpUlDeIGCsLvB9AWhVVgepDowk_AZMHHrvI517RfmxJE0sl9XHWsGs0LoNGh7edwBXb-7gOJAED02E',
        'secret' => 'EBB7c_QRIAV1gvH7FCuL0cbnLpRaO1MlyW1rmA8qz-8U58gOBt33_QEcT_RixQtEgAkEdCd_v4_cwVZV'
    ],

    'mandrill' => [
        'secret' => env('MANDRILL_KEY'),
    ],
];
