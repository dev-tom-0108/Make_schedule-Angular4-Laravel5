<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToShiftsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('shifts', function(Blueprint $table)
		{
			$table->foreign('floor_package_id', 'fk_shift_floor_packages1')->references('id')->on('floor_packages')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('shift_package_id', 'fk_shifts_shift_packages1')->references('id')->on('shift_packages')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('shifts', function(Blueprint $table)
		{
			$table->dropForeign('fk_shift_floor_packages1');
			$table->dropForeign('fk_shifts_shift_packages1');
		});
	}

}
