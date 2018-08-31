<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('tables', function(Blueprint $table)
		{
			$table->foreign('floor_package_id', 'fk_tables_floor_packages1')->references('id')->on('floor_packages')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('floor_id', 'fk_tables_floors1')->references('id')->on('floors')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('tables', function(Blueprint $table)
		{
			$table->dropForeign('fk_tables_floor_packages1');
			$table->dropForeign('fk_tables_floors1');
		});
	}

}
