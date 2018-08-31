<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToAssignedTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('assigned_tables', function(Blueprint $table)
		{
			$table->foreign('booking_id', 'fk_assigned_tables_bookings2')->references('id')->on('bookings')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('table_id', 'fk_assigned_tables_tables1')->references('id')->on('tables')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('assigned_tables', function(Blueprint $table)
		{
			$table->dropForeign('fk_assigned_tables_bookings2');
			$table->dropForeign('fk_assigned_tables_tables1');
		});
	}

}
