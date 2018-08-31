<?php

namespace Fcc\Chope;

use Illuminate\Support\ServiceProvider;

class ChopeServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
	    $this->app->bind(ChopeClient::class, function ($app) {
		    return new ChopeClient();
	    });
    }

	/**
	 * Get the services provided by the provider.
	 *
	 * @return array
	 */
	public function provides()
	{
		return [ChopeClient::class];
	}
}
