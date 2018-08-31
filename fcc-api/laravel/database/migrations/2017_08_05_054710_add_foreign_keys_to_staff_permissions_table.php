<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

class AddForeignKeysToStaffPermissionsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('staff_permissions', function(Blueprint $table)
		{
			$table->foreign('permission_id', 'fk_staff_staff_permissions_staff_permissions1')->references('id')->on('permissions')->onUpdate('NO ACTION')->onDelete('NO ACTION');
			$table->foreign('staff_id', 'fk_staff_staff_permissions_staffs1')->references('id')->on('staffs')->onUpdate('NO ACTION')->onDelete('NO ACTION');
		});
	}


	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('staff_permissions', function(Blueprint $table)
		{
			$table->dropForeign('fk_staff_staff_permissions_staff_permissions1');
			$table->dropForeign('fk_staff_staff_permissions_staffs1');
		});
	}

}
