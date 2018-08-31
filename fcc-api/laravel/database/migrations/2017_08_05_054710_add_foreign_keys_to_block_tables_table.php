<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToBlockTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('block_tables', function(Blueprint $table)
		{
			$table->foreign('table_id', 'fk_block_tables_tables1')->references('id')->on('tables')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('block_tables', function(Blueprint $table)
		{
			$table->dropForeign('fk_block_tables_tables1');
		});
	}

}
