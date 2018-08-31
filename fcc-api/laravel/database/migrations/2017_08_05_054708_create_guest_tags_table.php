<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateGuestTagsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('guest_tags', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->integer('guest_id')->unique('guest_id_UNIQUE');
			$table->string('tag_name')->unique('tag_name_UNIQUE');
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
		Schema::drop('guest_tags');
	}

}
