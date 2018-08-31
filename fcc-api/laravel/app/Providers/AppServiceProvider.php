<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        Schema::defaultStringLength(191);
        // Validator for min_if
        Validator::extend('min_if', function ($attribute, $value, $parameters, $validator) {
            $inputs = $validator->getData();
            if (isset($inputs["MaximumNumberofPeoplePerBooking"])) {
              return $inputs["MaximumNumberofPeoplePerBooking"] > $inputs["MinimumNumberofPeoplePerBooking"];
            }
            return false;
          });
        // Validator for Phone
        Validator::extend('phone', function ($attribute, $value, $parameters, $validator) {
            $inputs = $validator->getData();
            $regex = "/^\+?\d{1,2}[\s-]?\d{2}[\s-]?\d{4}[\s-]?\d{4,5}$/i";
            return preg_match($regex, $inputs['phone']);
        });
        // Validator for list        
        Validator::extend('list', function ($attribute, $value, $parameters, $validator) {
            $config=config('rules');
            return in_array($value, $config[$parameters[0]]);
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        if ($this->app->environment() !== 'production') {
            $this->app->register(\Way\Generators\GeneratorsServiceProvider::class);
            $this->app->register(\Xethron\MigrationsGenerator\MigrationsGeneratorServiceProvider::class);
            $this->app->register(\L5Swagger\L5SwaggerServiceProvider::class);
        }
        //
    }
}
