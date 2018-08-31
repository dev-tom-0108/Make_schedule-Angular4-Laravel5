<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateGuestsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('guests', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('name');
			$table->string('email');
			$table->string('phone');
			$table->string('wechat_account')->nullable();
			$table->string('alipay_accoun_id')->nullable();
			$table->string('alipay_account_name')->nullable();
			$table->string('company_name')->nullable();
			$table->boolean('is_del')->default(0)->comment('1: deleted');
			$table->boolean('is_block')->default(0)->comment('1: blocked');
			$table->boolean('is_vip')->default(0)->comment('1: vip');
            $table->text('token', 65535)->nullable();
			$table->string('token_issued_at')->nullable();
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
		Schema::drop('guests');
	}

}
