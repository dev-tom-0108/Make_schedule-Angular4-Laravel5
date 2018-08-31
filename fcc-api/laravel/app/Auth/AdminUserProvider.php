<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Str;

use Illuminate\Support\Facades\DB;
use Log;

class AdminUserProvider extends EloquentUserProvider
{
    /**
     * @param  mixed  $identifier
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveById($identifier)
    {
        print_r($identifier);
        // Get and return a user by their unique identifier
    }

    /**
     * @param  mixed   $identifier
     * @param  string  $token
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByToken($identifier, $token)
    {
        print_r($identifier);
        
        // Get and return a user by their unique identifier and "remember me" token
    }

    // /**
    //  * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
    //  * @param  string  $token
    //  * @return void
    //  */
    public function updateRememberToken(Authenticatable $user, $token)
    {
        // Save the given "remember me" token for the given user

    }

    /**
     * Retrieve a user by the given credentials.
     *
     * @param  array  $credentials
     * @return \Illuminate\Contracts\Auth\Authenticatable|null
     */
    public function retrieveByCredentials(array $credentials)
    {
        $model = $this->createModel()->newQuery();
        if (empty($credentials['email']) && $credentials['account_name']) {
            $model->where('account_name', $credentials['account_name']);
        } else {
            $model->where('email', $credentials['email']);
        }
        $user = $model->first();       
        return $user;
    }

    /**
     * Validate a user against the given credentials.
     *
     * @param  \Illuminate\Contracts\Auth\Authenticatable  $user
     * @param  array  $credentials
     * @return bool
     */   
    public function validateCredentials(Authenticatable $user, array $credentials)
    {
        return parent::validateCredentials($user, $credentials);
    }
}