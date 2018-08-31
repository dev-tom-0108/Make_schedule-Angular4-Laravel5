<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateAssignedTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('assigned_tables', function(Blueprint $table)
		{
			$table->integer('table_id');
			$table->integer('booking_id')->index('fk_assigned_tables_bookings2');
			$table->timestamps();
			$table->primary(['table_id','booking_id']);
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('assigned_tables');
	}

}
