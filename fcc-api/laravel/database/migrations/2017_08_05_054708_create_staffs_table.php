<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateStaffsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('staffs', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('firstname');
			$table->string('lastname');
			$table->string('email');
			$table->string('account_name')->unique('account_name_UNIQUE');
			$table->string('password');
			$table->string('phone', 20)->nullable();
			$table->integer('role')->comment('0:admin, 1: staff, 2: Waiter');
			$table->string('profile_image')->nullable();
			$table->string('table_color')->nullable()->comment('#FFEEBB');
			$table->text('token', 65535)->nullable();
			$table->string('reset_pwd_token')->nullable();
			$table->dateTime('reset_pwd_issued_time')->nullable();
            $table->integer('reset_pwd_limit')->nullable();
			$table->enum('language', array('cn','en'))->default('cn');
			$table->boolean('is_enabled')->nullable()->default(0)->comment('1: enable, 0: disable');
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
		Schema::drop('staffs');
	}

}
