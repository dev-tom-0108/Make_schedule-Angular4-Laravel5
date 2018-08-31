<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateBookingsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('bookings', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->string('booking_number')->comment('000001');
			$table->date('date');
			$table->time('time');
			$table->float('hours');
            $table->integer('number_of_people');
            $table->enum('status', array('Booked','Confirmed','Partially seated','Seated','Not arrived yet','Waiting in bar','Got the check', 'Completed', 'No show', 'Cancel', 'Cancel & Refund'));
			$table->integer('guest_id')->nullable()->default(0)->comment('0: Walk-in guest');
			$table->integer('shift_package_id')->index('fk_bookings_shift_packages1_idx');
			$table->integer('shift_id');
			$table->integer('floor_package_id')->index('fk_bookings_floor_packages1_idx');
			$table->string('assigned_tables')->nullable();
			$table->string('notes_by_guest', 1024)->nullable();
			$table->string('notes_by_staff', 1024)->nullable();
			$table->string('expense')->nullable();
			$table->string('referenced_by', 225)->nullable();
			$table->float('deposit_amount', 10, 0)->nullable();
			$table->enum('deposit_method', array('wxpay','alipay'))->nullable();
			$table->string('deposit_transaction_id')->nullable();
			$table->string('refund_error')->nullable();
			$table->dateTime('refund_at')->nullable();
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
		Schema::drop('bookings');
	}

}
