<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateTablesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('tables', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->integer('table_number');
			$table->string('table_name')->nullable();
			$table->integer('seats');
			$table->integer('seat_from');
			$table->integer('seat_to');
			$table->integer('style')->comment('0:Rectangle
1:Circle');
			$table->integer('floor_id')->index('fk_tables_floors1_idx');
			$table->integer('floor_package_id')->index('fk_tables_floor_packages1_idx');
			$table->timestamps();
			$table->boolean('non_reservable')->default(0);
			$table->text('table_layout', 65535)->nullable()->comment('json string');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('tables');
	}

}
