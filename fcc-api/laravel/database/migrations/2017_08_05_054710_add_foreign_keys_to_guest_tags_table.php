<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToGuestTagsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('guest_tags', function(Blueprint $table)
		{
			$table->foreign('guest_id', 'fk_guest_tags_guests1')->references('id')->on('guests')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('tag_name', 'fk_guest_tags_tags1')->references('name')->on('tags')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('guest_tags', function(Blueprint $table)
		{
			$table->dropForeign('fk_guest_tags_guests1');
			$table->dropForeign('fk_guest_tags_tags1');
		});
	}

}
