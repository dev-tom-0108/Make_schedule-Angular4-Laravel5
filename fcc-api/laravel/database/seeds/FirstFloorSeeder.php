<?php

use Illuminate\Database\Seeder;
use App\Models\Floors;

class FirstFloorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Floors::create(array('number' => 1, 'name' => 'First Floor'));
    }
}
