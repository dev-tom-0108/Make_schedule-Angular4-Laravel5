<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Tables extends Model
{
	protected static function boot()
	{
	    parent::boot();

	    // Order by name ASC
	    static::addGlobalScope('order', function (Builder $builder) {
	        $builder->orderBy('table_name', 'asc');
	    });
	}
}
