<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateNotificationsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('notifications', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->enum('type', array('BookingCreated','BookingChanged','BookingDeleted','GuestCreated','GuestChanged','GuestDeleted','StaffCreated','StaffChanged','StaffDeleted'));
			$table->integer('staff_id');
			$table->string('key_info1')->nullable();
			$table->string('key_info2')->nullable();
			$table->string('key_info3')->nullable();
			$table->string('key_info4')->nullable();
			$table->string('key_info5')->nullable();
			$table->boolean('is_read')->default(0);
            $table->integer('created_by')->default(0);
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
		Schema::drop('notifications');
	}

}
