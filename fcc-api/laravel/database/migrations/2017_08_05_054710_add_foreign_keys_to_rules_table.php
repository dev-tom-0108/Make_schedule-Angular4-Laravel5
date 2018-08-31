<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToRulesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('rules', function(Blueprint $table)
		{
			$table->foreign('shift_package_id', 'fk_rule_shift_packages1')->references('id')->on('shift_packages')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('rules', function(Blueprint $table)
		{
			$table->dropForeign('fk_rule_shift_packages1');
		});
	}

}
