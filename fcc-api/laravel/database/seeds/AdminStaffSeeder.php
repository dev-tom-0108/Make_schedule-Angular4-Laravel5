<?php

use Illuminate\Database\Seeder;
use App\Models\Staff;

class AdminStaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
		Staff::create(array('account_name' => 'admin', 
							'email' 	=> 'admin@fccworld.cn', 
							'password' 	=> '123456789', 
							'phone' 	=> '+11111111111',
							'firstname' => 'fname',
							'lastname' 	=> 'lname',
							'role' 		=> 0
						));
    }
}
