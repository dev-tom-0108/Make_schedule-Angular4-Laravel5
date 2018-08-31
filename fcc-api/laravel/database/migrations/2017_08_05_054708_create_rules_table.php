<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateRulesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('rules', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('name');
			$table->dateTime('start');
			$table->dateTime('end');
			$table->enum('repeat', array('none', 'everyDay', 'everyWeek', 'everyMonth', 'everyYear'))->nullable();
			$table->dateTime('repeat_end')->nullable();
			$table->integer('shift_package_id')->nullable()->index('fk_rule_shift_packages1_idx')->comment('0: closed date');
			$table->string('color')->nullable()->comment('#FFEEBB');
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
		Schema::drop('rules');
	}

}
