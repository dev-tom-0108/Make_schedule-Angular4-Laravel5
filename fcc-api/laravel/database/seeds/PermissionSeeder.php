<?php

use Illuminate\Database\Seeder;
use App\Models\Permissions;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
		Permissions::create(array('name' => 'dashboard'));
		Permissions::create(array('name' => 'bookings'));
		Permissions::create(array('name' => 'guests'));
		Permissions::create(array('name' => 'staffs'));
		Permissions::create(array('name' => 'settings'));
    }
}
