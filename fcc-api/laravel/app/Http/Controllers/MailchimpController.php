<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MailchimpController extends Controller
{
	public static function subscribe($email)
    {
        $mailchimp = app('Mailchimp');
    	$mailchimp->lists->subscribe(
            '32858cf982',
            ['email' => $email]
        );
    }

    public static function sendMail()
    {
    	$mailchimp = app('Mailchimp');
        // var_dump($mailchimp);
        $subject = 'Create Booking';
        $email = "andrey690062@gmail.com";
        $content = "ao[ks";
        self::subscribe($email);

    	$options = [
	        'list_id' => '32858cf982',
	        'subject' => $subject,
	        'from_name' => 'fccchina',
	        'from_email' => 'tech@wodebox.com',
	        'to_name' => $email
	    ];

	    $content = [
	        'html' => (string)view('mailchimp', ['content' => $content]),
	        'text' => $content
	    ];
        // var_dump($mailchimp);
        $campaign = $mailchimp->campaigns->create('regular', $options, $content);
        $mailchimp->campaigns->send($campaign['id']);
        // echo "email send";
    }
}
