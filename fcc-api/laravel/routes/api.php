<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET,PUT,POST,DELETE,OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, x-xsrf-token, Authorization');

// app api
Route::group(['prefix' => 'app'], function() {
    Route::post('/guests', 'GuestController@create_user_by_sms');
	Route::post('/sms', 'GuestController@send_code');
    Route::post('/login', 'GuestController@login_with_code');
    Route::post('/login_wechat', 'GuestController@login_with_wechat');
    Route::post('/send_mail', 'MailchimpController@sendMail');
    // Bookings
	Route::get('/timeslots', 'BookingController@getTimeSlotsInfo');
	Route::get('/tables', 'BookingController@getAvailableTablesInfo');

    // Wechat
    Route::get('/wechat/auth_js', 'WechatController@authJs');
    Route::get('/wechat/auth_qr', 'WechatController@authQr');
    Route::get('/wechat/auth_redirect', 'WechatController@authRedirect');

    // Settings
    Route::get('/settings', 'SettingsController@getRulesAndGeneralSettings');

    Route::group(['middleware' => ['auth.guest']], function() {
        
        // Bookings
        Route::post('/bookings', 'BookingController@createBooking');        
        Route::get('/bookings/{id}', 'BookingController@getBookingByGuestId');

        // Guest
        Route::get('/guests/{id}', 'GuestController@getGuest');
        Route::put('/guests/{id}', 'GuestController@updateGuest');
        
        // CheckToken
        Route::get('/token', function(){
            return response()->json(['success' => 'true']);
        });        
    });
});
use App\Events\EventNotification;
// admin api
Route::group(['prefix' => 'admin'], function() {

    // for redis test
    Route::get('/send_notification', function () {
        try {
            event(new EventNotification( 'name'));
            return response()->json(['success' => 'true']);
            
        } catch(\Exception $e) {
            return response()->json(['success' => 'false']);
        }
    });
    

    Route::post('/register', 'StaffController@register_user');

    Route::post('/login', 'StaffController@login');
    Route::post('/refresh', 'StaffController@refresh');

    Route::post('/password/email', 'StaffController@sendResetLinkEmail');

    Route::group(['middleware' => ['auth.admin:api_admin']], function() {

        // for test
        // Route::get('/', function(Request $request) {
        //     if (!$request->user->authorizeRoles(['Dashboard', 'manager']))
        //         return response()->json(['error' => 'false']);
        //     return response()->json(['success' => 'true']);
        // });
        
        // Guest
        Route::post('/guests', 'GuestController@createGuest');                
        Route::get('/guests/{id}', 'GuestController@getGuest');
        Route::get('/guests', 'GuestController@getAllGuest');
        Route::delete('/guests/{id}', 'GuestController@deleteGuest');
        Route::put('/guests/{id}', 'GuestController@updateGuest');
        Route::put('/block_guests/{id}', 'GuestController@blockGuest');

        // Staff
        Route::post('/staffs', 'StaffController@register_user');                        
        Route::get('/staffs/{id}', 'StaffController@getStaff');
        Route::get('/staffs', 'StaffController@getAllStaff');
        // Route::get('/staffs/assign', 'StaffController@getAllStaff');
        Route::delete('/staffs/{id}', 'StaffController@deleteStaff');
        Route::put('/staffs/{id}', 'StaffController@updateStaff');
        
        Route::put('/staffs/tables/{id}', 'StaffController@assignedTableToStaff');
        Route::delete('/staffs/tables/{id}', 'StaffController@removeAllTablesFromStaff');
        Route::put('/staffs/color/{id}', 'StaffController@changeColorOfStaff');
        Route::put('/staff_permission/{id}', 'StaffController@setStaffPermission');
        
        // Route::post('/logout', 'StaffController@logout');
        Route::get('/notification/{id}', 'ApiController@getNotification');
        Route::put('/notification/{id}', 'ApiController@updateNotification');

        // Bookings
        Route::post('/bookings', 'BookingController@createBooking');        
        Route::get('/bookings', 'BookingController@getAllBookings');
        Route::get('/bookings/total', 'BookingController@getTotalCountofAllBookings');
        Route::get('/bookings/{id}', 'BookingController@getBooking');
        Route::put('/bookings/{id}', 'BookingController@updateBooking');
        Route::put('/bookings/status/{id}', 'BookingController@updateBookingStatus');
        Route::delete('/bookings/{id}', 'BookingController@deleteBooking');

        Route::get('/bookings/guest/{id}', 'BookingController@getBookingByGuestId');
        Route::get('/bookings/table/{id}', 'BookingController@getBookingByTableId');
        Route::put('/bookings/table/{id}', 'BookingController@updateAsignedTable');

        Route::get('/timeslots', 'BookingController@getTimeSlotsInfo');
        Route::get('/bookabletables', 'BookingController@getAvailableTablesInfo');

        Route::get('/token', function(){
            return response()->json(['success' => 'true']);
        });        

        // Settings
        Route::group(['prefix' => 'settings'], function ()
        {
            // Gernal
            // Route::post('/general', 'SettingsController@createGeneralSettings');
            Route::get('/general', 'SettingsController@getGeneralSettings');
            Route::put('/general', 'SettingsController@updateGeneralSettings');
            Route::put('/general/shiftpackage/{id}', 'SettingsController@updateGeneralDefaultShiftPackage');
            Route::put('/general/floorpackage/{id}', 'SettingsController@updateGeneralDefaultFloorPackage');
            Route::get('/allrules', 'SettingsController@getRulesAndGeneralSettings');

            // Rules
            Route::post('/rules', 'SettingsController@createRule');
            Route::get('/rules', 'SettingsController@getRules');
            Route::put('/rules/{id}', 'SettingsController@updateRule');
            Route::delete('/rules/{id}', 'SettingsController@deleteRule');

            // Shift Package
            Route::post('/shift_packages', 'SettingsController@createShiftPackage');
            // Route::post('/publish_shift_package/{id}', 'SettingsController@publishShiftPackage');
            Route::get('/shift_packages', 'SettingsController@getShiftPackages');
            Route::put('/shift_packages/{id}', 'SettingsController@updateShiftPackages');
            Route::delete('/shift_packages/{id}', 'SettingsController@deleteShiftPackages');

            // Shifts
            Route::post('/shifts', 'SettingsController@createShift');
            // Route::post('/enable_shift/{id}', 'SettingsController@enableShift');
            Route::get('/shifts', 'SettingsController@getAllShifts');
            Route::get('/shifts/{id}', 'SettingsController@getShifts');
            Route::put('/shifts/{id}', 'SettingsController@updateShifts');
            Route::put('/shifts/package/{id}', 'SettingsController@updateShiftsForPackageID');
            Route::delete('/shifts/{id}', 'SettingsController@deleteShifts');

            // Floor package
            Route::post('/floor_packages', 'SettingsController@createFloorPackage');
            Route::get('/floor_packages', 'SettingsController@getFloorPackages');
            Route::put('/floor_packages/{id}', 'SettingsController@updateFloorPackages');
            Route::delete('/floor_packages/{id}', 'SettingsController@deleteFloorPackages');

            // Floor
            Route::post('/floors', 'SettingsController@createFloor');
            Route::get('/floors', 'SettingsController@getFloors');
            Route::put('/floors/{id}', 'SettingsController@updateFloors');
            Route::delete('/floors/{id}', 'SettingsController@deleteFloors');

            // Tables
            Route::post('/tables', 'SettingsController@createTable');
            Route::get('/tables', 'SettingsController@getTables');
            Route::get('/tables/package/{id}', 'SettingsController@getTablesByPackageID');
            Route::put('/tables/{id}', 'SettingsController@updateTables');
            Route::delete('/tables/{id}', 'SettingsController@deleteTables');
            Route::put('/table_draw_data/{id}', 'SettingsController@updateTableDrawData');  
            Route::put('/tables/package/{id}', 'SettingsController@upgradeTablesByPackageID');

            Route::post('/tables/block', 'SettingsController@blockTable');
            Route::get('/tables/block', 'SettingsController@getBlockTables');
            Route::post('/tables/unblock/{id}', 'SettingsController@unblockTable');
            
            // tags
            Route::get('/tags', 'SettingsController@getTags');

            // permissions
            Route::get('/permissions', 'SettingsController@getPermissions');
            
        });
        
    });
});