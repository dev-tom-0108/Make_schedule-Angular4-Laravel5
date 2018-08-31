<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class CreateStaffPermissionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('staff_permissions', function(Blueprint $table)
		{
			$table->integer('id', true);
			$table->integer('staff_id')->index('fk_staff_staff_permissions_staffs1_idx');
			$table->integer('permission_id')->index('fk_staff_staff_permissions_staff_permissions1_idx');
			$table->boolean('is_write')->nullable();
			$table->boolean('is_read')->nullable();
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
		Schema::drop('staff_permissions');
	}

}
