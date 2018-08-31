<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddFieldsToBookingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
	    Schema::table('bookings', function($table) {
		    $table->integer('chope_reservation_id')->nullable()->unsigned()->after('booking_number');
		    $table->string('chope_confirmation_id')->nullable()->after('chope_reservation_id');
		    $table->text('chope_error')->nullable()->after('chope_confirmation_id');
	    });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
	    Schema::table('bookings', function($table) {
		    $table->dropColumn('chope_reservation_id');
		    $table->dropColumn('chope_confirmation_id');
	    });
    }
}
