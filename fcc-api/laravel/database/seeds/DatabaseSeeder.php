<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // create Admin Staff
        $this->call( AdminStaffSeeder::class );
        $this->command->info( 'Staff Admin created!' );

        // create Permission list
        $this->call( PermissionSeeder::class );
        $this->command->info( 'Permission list is generated!' );

        // create first Floor
        $this->call( FirstFloorSeeder::class );
        $this->command->info( 'First Floor created!' );
    }
}
