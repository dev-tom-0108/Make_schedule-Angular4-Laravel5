<?php

namespace App\Providers;

use Carbon\Carbon;
use Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Contracts\Auth\Access\Gate as GateContract;
use App\Auth\AdminUserProvider;
use App\Auth\GuestUserProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot(GateContract $gate)
    {
        $this->registerPolicies($gate);

        // Binding eloquent.admin to our AdminUserProvider
        Auth::provider('eloquent.admin', function($app, array $config) {
            return new AdminUserProvider($app['hash'], $config['model']);
        });

        // Binding eloquent.guest to our GuestUserProvider
        Auth::provider('eloquent.guest', function($app, array $config) {
            return new GuestUserProvider($app['hash'], $config['model']);
        });
    }
}
