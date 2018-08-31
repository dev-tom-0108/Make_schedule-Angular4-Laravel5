<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToStaffTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('staff_tables', function(Blueprint $table)
		{
			$table->foreign('staff_id', 'fk_staff_table_staff1')->references('id')->on('staffs')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('table_id', 'fk_staff_table_tables1')->references('id')->on('tables')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('shift_id', 'fk_staff_tables_shifts1')->references('id')->on('shifts')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('staff_tables', function(Blueprint $table)
		{
			$table->dropForeign('fk_staff_table_staff1');
			$table->dropForeign('fk_staff_table_tables1');
			$table->dropForeign('fk_staff_tables_shifts1');
		});
	}

}
