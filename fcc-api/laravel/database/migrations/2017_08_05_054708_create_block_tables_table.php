<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateBlockTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('block_tables', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->integer('table_id')->index('fk_block_tables_tables1_idx');
			$table->date('block_date');
			$table->boolean('is_allday')->default(0)->comment('1: all day, 0: time range');
			$table->time('time_range_from')->nullable();
			$table->time('time_range_to')->nullable();
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
		Schema::drop('block_tables');
	}

}
