<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateSmsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('sms', function(Blueprint $table)
		{
			$table->integer('id', true);
            $table->string('phone_number', 20)->nullable();
            $table->integer('sms_code')->nullable();;
            $table->integer('sms_time_limit')->nullable();;
            $table->integer('sms_count_limit')->nullable();;
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
		Schema::drop('sms');
	}

}
