<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateShiftsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('shifts', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('name');
			$table->text('time_slots', 65535)->comment('JSON data({from:to},{from:to}...)');
			$table->integer('floor_package_id')->default(0)->index('fk_shift_floor_packages1_idx')->comment('0: default package');
			$table->integer('shift_package_id')->index('fk_shifts_shift_packages1_idx');
			$table->float('shift_atb')->default(1)->comment('hours(unit)');
			$table->float('deposit_amount', 10, 0)->nullable();
			$table->boolean('is_enabled')->default(1)->comment('1: enable, 0: disable');
			$table->timestamps();
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('shifts');
	}

}
