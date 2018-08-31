<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateStaffTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('staff_tables', function(Blueprint $table)
		{
			$table->integer('staff_id');
			$table->integer('table_id')->index('fk_staff_table_tables1_idx');
			$table->dateTime('apply_date');
			$table->integer('shift_id')->index('fk_staff_tables_shifts1_idx');
			$table->timestamps();
			$table->primary(['staff_id','table_id']);
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('staff_tables');
	}

}
