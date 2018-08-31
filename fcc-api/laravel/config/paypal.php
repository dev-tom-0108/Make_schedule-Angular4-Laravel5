<?php

return [
    //live
    'clientId' => 'Ab3Z5OjRgCVBASd55BRU6rKUl7n6tVa8XGb8IbtLQgSfLvRb6kiGuk5HokRMXcPtWFQyMoTBfL-QMFTy',
    'clientSecret' => 'EFGccUrnzS4_4qxdUO5L39Bgrp-ViOue_0fOZ-RXBqKQdWTKc9Br9sCYenX0ueO4IYUsBAFSBfgUE5zD',
    //sandbox
    //'clientId' => 'ARGqVO2-xHe_k_0Z2FlGK4OKvEANPH6tXKqHW-jWSpX4_rRanX1dKEOhZ19EihZ-_D7itfS48lXz059l',
    //'clientSecret' => 'EIjU4M6bd7LySNGhAhaezI06-RQHqI5TM_5ppK5o9l1vdBarMOr9sHY7rXEhb9sMzaYomgGlJIXaPJAK',

    'settings' => array(
        'mode' => 'live',//'mode' => 'sandbox',
        'service.EndPoint' => 'https://api.paypal.com',//'service.EndPoint' => 'https://api.sandbox.paypal.com',
        'http.ConnectionTimeOut' => 30,
        'log.LogEnabled' => true,
        'log.FileName' => storage_path('logs/paypal.log'),
        'log.LogLevel' => 'FINE'
        ),

    'returnUrl' => 'http://bookings.taian-table.com/#!/booking?confirm=true',
    'cancelUrl' => 'http://bookings.taian-table.com/#!/booking?cancel=true',
    'currency' => 'HKD',
    'description' => 'Taian Booking'

];
