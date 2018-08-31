<?php

namespace App\Http\Controllers;

use Fcc\Chope\ChopeClient;
use Fcc\Chope\ChopeResponseException;
use Illuminate\Http\Request;
use App\Models\Bookings;
use App\Models\Rules;
use App\Models\Shifts;
use App\Models\Settings;
use App\Models\Tables;
use App\Models\Guest;
use App\Models\AssignedTables;
use DB;

class BookingController extends ApiController
{
    private function _getAvailableTableId(Request $request) {
        $date = $request->date;
        $time = $request->time;
        $seat = $request->number_of_people;
        $floor_package_id = $request->floor_package_id;

        $tables = Tables::whereRaw(
           " tables.floor_package_id = '$floor_package_id'
            and tables.seat_from <= '$seat'
            and tables.seat_to >= '$seat'
            and id not in (
            select block_tables.table_id from block_tables
            where block_tables.block_date = '$date'
            and (block_tables.is_allday = 1 or 
            (CAST('$time' AS TIME) between block_tables.time_range_from and block_tables.time_range_to))
            )
            and id not in (
            select assigned_tables.table_id as id from bookings, assigned_tables
            where bookings.date = '$date'
            and TIMEDIFF(CAST('$time' AS TIME), bookings.time) BETWEEN 0 AND bookings.hours * 3600
            and bookings.id = assigned_tables.booking_id
            and bookings.floor_package_id = '$floor_package_id'
            )"
        )->get();
        if (count($tables)) {
            return $tables[0]->id;
        }
        return null;
    }

    private function _getAllBookings(Request $request, $isCount = false) {

        $this->setLang($request->lang);
        $search = $request->query('s');    
        if (!isset($search)) {
            $search = '';
        }
        // $booking = Bookings::query()->get();
        $bookings = Bookings::leftJoin('guests', 'bookings.guest_id', '=', 'guests.id');            
        $bookings->leftJoin('shifts', 'bookings.shift_id', '=', 'shifts.id');

        // if ($search) {
            $bookings->where(function ($q) use ($search)
            {
                $q->where('guests.name', 'like', '%'.$search.'%')
                    ->orWhere('bookings.booking_number', 'like', '%'.$search.'%')
                    ->orWhere('guests.phone', 'like', '%'.$search.'%')
                    ->orWhere('guests.email', 'like', '%'.$search.'%');
            });
        // }
                    
        if ($request->date) {
            $bookings->where('bookings.date', '=', $request->date);
        }

        if ($request->shift_package_id) {
            $bookings->where('bookings.shift_package_id', '=', $request->shift_package_id);
        }

        if ($request->shift_id) {
            $bookings->where('bookings.shift_id', '=', $request->shift_id);
        }

        $bookings->select(DB::Raw(
            'bookings.*, 
            IFNULL(guests.name, "") as name,
            IFNULL(guests.email, "") as email,
            IFNULL(guests.phone, "") as phone, 
            IFNULL(guests.is_vip, "") as is_vip, 
            IFNULL(shifts.name, "") as shift_name'
        ));

        if ( isset($request->offset)  && isset($request->pagesize)) {
            $bookings->offset($request->offset)
            ->limit($request->pagesize);
        }


        $bookings = $bookings->get();

        if ($isCount)
            return $bookings->count();

        foreach ($bookings as $booking) {
            $table_ids = AssignedTables::join('tables', 'tables.id', '=', 'assigned_tables.table_id')
                        ->where('booking_id', '=', $booking->id)
                        ->select('tables.id', 'tables.table_name as name')
                        ->get();

            $booking['tables'] = $table_ids;

            // tags
            $booking['guest_tags'] = [];
            if ($booking->guest_id) {
                $tag_names = DB::table('guests')
                ->leftJoin('guest_tags', 'guests.id', '=', 'guest_tags.guest_id')
                ->select('guest_tags.tag_name')
                ->whereRaw("guests.id = '$booking->guest_id'")
                ->get(); 
    
                if (count($tag_names)) {
                    $tags = array();
                    foreach ( $tag_names as $tag_name) {
                        $tag = DB::table('tags')->whereRaw("tags.name = '$tag_name->tag_name'")->get();
                        if (count($tag))
                            $tags[] = $tag[0];
                    }
                    $booking['guest_tags'] = $tags;
                }
            }

        }
        return $bookings;  
    }
    /**
     * @SWG\Post(
     *     path="/admin/bookings",
     *     tags={"Admin"},
     *     summary="Create a booking",
     *     description="",
     *     operationId="api.admin.createtable",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="date",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="time",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="hours",
     *                  type="float",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="number_of_people",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="guest_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="status",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="shift_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="shift_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="floor_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a table successfully"
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function createBooking(Request $request, ChopeClient $chopeClient) {
        $this->setLang($request->lang);

        if (!$request->headers->user->authorizeRoles('bookings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }

        $validator = $this->checkValidation($request,'booking_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $user = Guest::find($request->guest_id);
        
        if ($user->is_block) {
            return $this->failResponse('STATUS_LOGIC_ERROR', 'user_is_blocked');                        
        }

        $book_number = Bookings::select(
            DB::raw("ifnull(lpad(max(CAST(booking_number as UNSIGNED)) + 1, 6, '0'), '000001') as number")
        )->get();
        $booking = new Bookings();
        $this->copyObject($booking, $request->except('lang', 'token', 'user'));
        $booking->booking_number = $book_number[0]->number;
        // get table
        $assigned_table = $this->_getAvailableTableId($request);
        $booking->assigned_tables = $assigned_table;

	    try {
		    $chopeResponse = $chopeClient->createBooking([
			    'last_name' => $user->name,
			    'adults' => $request->get('number_of_people'),
			    'date_time' => strtotime($request->get('date') . ' ' . $request->get('time')),
			    'email'  => $user->email,
			    'phone' => $user->phone,
			    'memebership_id' => $user->id
		    ]);

		    $booking->chope_reservation_id = $chopeResponse->reservation_id;
			$booking->chope_confirmation_id = $chopeResponse->confirmation_id;
		} catch (ChopeResponseException $e){
		    $booking->chope_error = $e->getMessage();
	    }

        // check if there is available table
        if (!$assigned_table) {
            // waiting list
            // $booking->status = 'Waiting in bar';
        }
        $booking->save();

        // assgn table
        if ($assigned_table) {
            $assigned = new AssignedTables();
            $assigned->table_id = $assigned_table;
            $assigned->booking_id = $booking->id;
            $assigned->save();
        }
        
        //$this->new_log($booking->guest_id, "Create Booking", $booking->id, NULL, NULL);

        // Send email to guest
        $this->sendBookingMail($booking, $user, 'created_booking');

        // Send email & notification to staffs
        $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
        $this->sendBookingMailToStaffs($booking, $user, 'created_booking_admin', $staff_id);
        $this->sendNotification('BookingCreated', $staff_id,  $booking->booking_number, $booking->date, $booking->time, $booking->number_of_people, $booking->status);

        return $this->jsonResponse('STATUS_SUCCESS', null, 'booking_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/bookings/total",
     *     tags={"Admin"},
     *     summary="Get total count of all bookings",
     *     description="",
     *     operationId="api.admin.gettotalcountallbookings",
     *     produces={"application/json"},
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getTotalCountofAllBookings(Request $request) {
        $bookings = $this->_getAllBookings($request, true);            

        if (!$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }

        return $this->jsonResponse('STATUS_SUCCESS', $bookings, 'booking_success_load');  
    }
    /**
     * @SWG\Get(
     *     path="/admin/bookings",
     *     tags={"Admin"},
     *     summary="Get all bookings",
     *     description="",
     *     operationId="api.admin.getallbookings",
     *     produces={"application/json"},
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getAllBookings(Request $request) {

        $bookings = $this->_getAllBookings($request);            
        if (!$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        return $this->jsonResponse('STATUS_SUCCESS', $bookings, 'booking_success_load');  
    }
    /**
     * @SWG\Get(
     *     path="/admin/bookings/guest/{id}",
     *     tags={"Admin"},
     *     summary="Get a booking by guest id",
     *     description="",
     *     operationId="api.app.getbooking",
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     produces={"application/json"},
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getBookingByGuestId($id, Request $request) {
        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        if (!$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $bookings = Bookings::whereRaw(
            "guest_id = '$id'"
        )
        ->orderByRaw("`date`, `time`")
        ->get();

        if ($bookings) {
            foreach ($bookings as $booking) {
                $table_ids = AssignedTables::join('tables', 'tables.id', '=', 'assigned_tables.table_id')
                            ->where('booking_id', '=', $booking->id)
                            ->select('tables.id', 'tables.table_name as name')
                            ->get();
    
                $booking['tables'] = $table_ids;
    
                // tags
                $booking['guest_tags'] = [];
                if ($booking->guest_id) {
                    $tag_names = DB::table('guests')
                    ->leftJoin('guest_tags', 'guests.id', '=', 'guest_tags.guest_id')
                    ->select('guest_tags.tag_name')
                    ->whereRaw("guests.id = '$booking->guest_id'")
                    ->get(); 
        
                    if (count($tag_names)) {
                        $tags = array();
                        foreach ( $tag_names as $tag_name) {
                            $tag = DB::table('tags')->whereRaw("tags.name = '$tag_name->tag_name'")->get();
                            if (count($tag))
                                $tags[] = $tag[0];
                        }
                        $booking['guest_tags'] = $tags;
                    }
                }
    
            }
    
            return $this->jsonResponse('STATUS_SUCCESS', $bookings, 'booking_success_load');  
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');            
        }
    }
    /**
     * @SWG\Get(
     *     path="/admin/bookings/table/{id}",
     *     tags={"Admin"},
     *     summary="Get a booking by table id",
     *     description="",
     *     operationId="api.app.getbookingbytableid",
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     produces={"application/json"},
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getBookingByTableId($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $bookings = Bookings::join('guests', 'bookings.guest_id', '=', 'guests.id');            
        $bookings->leftJoin('shifts', 'bookings.shift_id', '=', 'shifts.id');
        $bookings->whereRaw(
            "bookings.id in (select booking_id as id from assigned_tables where table_id = '$id')"
        )->orderByRaw("`date`, `time`");

        $booking_first = Bookings::select(DB::raw("bookings.*, '', '', '','', 'shifts.name as shift_name'"))
        ->where('bookings.guest_id', '=', 0);
        $booking_first->leftJoin('shifts', 'bookings.shift_id', '=', 'shifts.id');
        $booking_first->whereRaw(
            "bookings.id in (select booking_id as id from assigned_tables where table_id = '$id')"
        )->orderByRaw("`date`, `time`");

        if ($request->date) {
            $bookings->where('bookings.date', '=', $request->date);
            $booking_first->where('bookings.date', '=', $request->date);
        }

        $bookings->select('bookings.*', 'guests.name', 'guests.email', 'guests.phone', 'guests.is_vip', 'shifts.name as shift_name');
        $bookings->union($booking_first);

        $bookings = $bookings->get();

        if ($bookings) {
            foreach ($bookings as $booking) {
                $table_ids = AssignedTables::join('tables', 'tables.id', '=', 'assigned_tables.table_id')
                            ->where('booking_id', '=', $booking->id)
                            ->select('tables.id', 'tables.table_name as name')
                            ->get();
    
                $booking['tables'] = $table_ids;
    
                // tags
                $booking['guest_tags'] = [];
                if ($booking->guest_id) {
                    $tag_names = DB::table('guests')
                    ->leftJoin('guest_tags', 'guests.id', '=', 'guest_tags.guest_id')
                    ->select('guest_tags.tag_name')
                    ->whereRaw("guests.id = '$booking->guest_id'")
                    ->get(); 
        
                    if (count($tag_names)) {
                        $tags = array();
                        foreach ( $tag_names as $tag_name) {
                            $tag = DB::table('tags')->whereRaw("tags.name = '$tag_name->tag_name'")->get();
                            if (count($tag))
                                $tags[] = $tag[0];
                        }
                        $booking['guest_tags'] = $tags;
                    }
                }
    
            }
    
            return $this->jsonResponse('STATUS_SUCCESS', $bookings, 'booking_success_load');  
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');            
        }
    }
    /**
     * @SWG\Get(
     *     path="/admin/bookings/{id}",
     *     tags={"Admin"},
     *     summary="Get a booking",
     *     description="",
     *     operationId="api.admin.getbooking",
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     produces={"application/json"},
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getBooking($id, Request $request) {
        $this->setLang($request->lang);        
        $booking = Bookings::find($id);
        if ($booking) {
            return $this->jsonResponse('STATUS_SUCCESS', $booking, 'booking_success_load');  
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');            
        }
    }
    /**
     * @SWG\Put(
     *     path="/admin/bookings/{id}",
     *     tags={"Admin"},
     *     summary="Update a booking",
     *     description="",
     *     operationId="api.admin.updatebooking",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="date",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="time",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="hours",
     *                  type="float",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="number_of_people",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="guest_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="status",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="shift_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="shift_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="floor_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function updateBooking($id, Request $request, ChopeClient $chopeClient) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('bookings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $booking = Bookings::find($id); 
         if ($booking) {
            $validator = $this->checkValidation($request,'booking_rules');
            if ($validator->fails()) {
                return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
            }
            $this->copyObject($booking, $request->except('lang', 'token', 'tables'));

	         // Request to chope api to Update or cancel
	         if ($booking->chope_reservation_id !== null){
	         	 $requestData = [
		             'reservation_id' => $booking->chope_reservation_id,
		             'membership_id' => $booking->guest_id
	             ];

	         	 try {
		             if ($booking->status == "Cancel" || $booking->status == "Cancel & Refund"){
			             $chopeClient->cancelBooking($requestData);
		             } else {
			             $chopeClient->updateBooking(array_merge([
				             'date_time' => strtotime($request->get('date') . ' ' . $request->get('time')),
				             'adults' => $request->get('number_of_people')
			             ], $requestData));
		             }
	             } catch (ChopeResponseException $e){
		             $booking->chope_error = $e->getMessage();
	             }
	         }

            $booking->save();

	        if(isset($request->tables)) {
                if (count($request->tables)) {

                    AssignedTables::where('booking_id', '=', $booking->id)->delete();

                    foreach ($request->tables as $table) {
                        $assigned = new AssignedTables();
                        $assigned->table_id = $table;
                        $assigned->booking_id = $id;
                        $assigned->save();
                    }
                } else {
                    AssignedTables::where('booking_id', '=', $booking->id)->delete();
                }
            }

             // Send email to guest
            $guest = Guest::find($booking->guest_id);
            $this->sendBookingMail($booking, $guest, 'created_booking');

            // Send email & notification to staffs
            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendBookingMailToStaffs($booking, $guest, 'created_booking_admin', $staff_id);
            $this->sendNotification('BookingChanged', $staff_id,  $booking->booking_number, $booking->date, $booking->time, $booking->number_of_people, $booking->status);

            return $this->jsonResponse('STATUS_SUCCESS', null, 'booking_success_update');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');
        }
    }
    /**
     * @SWG\Put(
     *     path="/admin/bookings/status/{id}",
     *     tags={"Admin"},
     *     summary="Update a booking",
     *     description="",
     *     operationId="api.admin.updatebookingstatus",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="status",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function updateBookingStatus($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('bookings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $booking = Bookings::find($id); 
        if ($booking) {
            $booking->status = $request->status;
            $booking->save();

            // Send email to guest
            $guest = Guest::find($booking->guest_id);
            $this->sendBookingMail($booking, $guest, 'created_booking');

            // Send email & notification to staffs
            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendBookingMailToStaffs($booking, $guest, 'created_booking_admin', $staff_id);
            $this->sendNotification('BookingChanged', $staff_id,  $booking->booking_number, $booking->date, $booking->time, $booking->number_of_people, $booking->status);

            return $this->jsonResponse('STATUS_SUCCESS', null, 'booking_success_update');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');
        }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/bookings/{id}",
     *     tags={"Admin"},
     *     summary="Delete a booking",
     *     description="",
     *     operationId="api.admin.deletebooking",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function deleteBooking($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('bookings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $booking = Bookings::find($id);
        if ($booking) {

            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendNotification('BookingDeleted', $staff_id,  $booking->booking_number, $booking->date, $booking->time, $booking->number_of_people, $booking->status);

            $booking->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'booking_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');
        }         
    }
    private function _getTimeSlots($date) {
        // rules
        $rules = Rules::whereRaw(
            "(rules.repeat_end is null or date(rules.repeat_end) > '$date')
            and (
            (rules.repeat = 'none' and date(rules.`start`) = '$date') or
            rules.repeat = 'everyDay' or 
            (rules.repeat = 'everyWeek' and WEEKDAY(rules.start) = WEEKDAY('$date'))
            or (rules.repeat = 'everyMonth' and DAY(rules.start) = DAY('$date'))
            or (rules.repeat = 'everyYear' and MONTH(rules.start) = MONTH('$date') and DAY(rules.start) = DAY('$date'))
            )"
        )
        ->orderByRaw("rules.created_at desc")
        ->get();
        
        // shifts
        if (count($rules)) {
            foreach ( $rules as $rule) {
                if ($rule->shift_package_id == null || $rule->shift_package_id == 0) {
                    // rest & holiday
                    $shifts = [];
                }
                else {
                    $shifts = Shifts::whereRaw(
                        "shifts.shift_package_id = '$rule->shift_package_id'
                        and shifts.is_enabled = 1"
                    )->get();
                    foreach ( $shifts as &$shift) {
                        $shift->time_slots = json_decode($shift->time_slots);
                    }
                }
                break;
            }   
        }
        else {
            // default shift package if rules is not
            $default_shift_package = Settings::whereRaw(
                "settings.`key` = 'DefaultShiftPackage'"
            )->get();

            $shift_package_id = $default_shift_package[0]->value;

            $shifts = Shifts::whereRaw(
                "shifts.shift_package_id = '$shift_package_id'
                and shifts.is_enabled = 1"                
            )->get();
            foreach ( $shifts as &$shift) {
                $shift->time_slots = json_decode($shift->time_slots);
            }
        }

        return $shifts;
    }
    // getTimeSlotsInfo
    /**
     * @SWG\Get(
     *     path="/app/timeslots",
     *     tags={"Guests"},
     *     summary="Get timeslots",
     *     description="",
     *     operationId="api.guest.timeslots",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="date",
     *          in="query",
     *          description="Date",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function getTimeSlotsInfo(Request $request) {
        $this->setLang($request->lang);
        
        if(isset($request->date)) {
            $date = $request->date;
        } else {
            return $this->failResponse('STATUS_LOGIC_ERROR', 'date_is_required');
        }

        $shifts = $this->_getTimeSlots($date);

        return $this->jsonResponse('STATUS_SUCCESS', $shifts);  
    }
    /**
     * @SWG\Get(
     *     path="/app/tables",
     *     tags={"Guests"},
     *     summary="Get available tables count",
     *     description="",
     *     operationId="api.guest.tables",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="date",
     *          in="query",
     *          description="Date",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          name="time",
     *          in="query",
     *          description="Time",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          name="seats",
     *          in="query",
     *          description="Seats",
     *          required=true,
     *          type="integer"
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="Successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    function getAvailableTablesInfo(Request $request) {
        $this->setLang($request->lang);

        $validator = $this->checkValidation($request,'available_table_rules');
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $date = $request->date;
        $time = $request->time;
        $seat = $request->seats;

        $tables = 0;
        // get timeslot for the date
        $shifts = $this->_getTimeSlots($date);
        if (!empty($shifts)) {
            foreach ($shifts as $shift) {
                foreach ($shift->time_slots as $timeslot) {
                    if ($timeslot == $time) {

                        $floor_package_id = $shift->floor_package_id;
                        $tables = Tables::whereRaw(
                            " tables.floor_package_id = '$floor_package_id'
                             and tables.seat_from <= '$seat'
                             and tables.seat_to >= '$seat'
                             and id not in (
                             select id from block_tables
                             where block_tables.block_date = '$date'
                             and (block_tables.is_allday = 1 or 
                             (CAST('$time' AS TIME) between block_tables.time_range_from and block_tables.time_range_to))
                             )
                             and id not in (
                             select assigned_tables.table_id as id from bookings, assigned_tables
                             where bookings.date = '$date'
                             and TIMEDIFF(CAST('$time' AS TIME), bookings.time) BETWEEN 0 AND bookings.hours * 3600
                             and bookings.id = assigned_tables.booking_id
                             and bookings.floor_package_id = '$floor_package_id'
                             )"
                         )->get();

                        return $this->jsonResponse('STATUS_SUCCESS', $tables->count());        
                    }
                }
            }
        }
        return $this->jsonResponse('STATUS_SUCCESS', $tables);  
    }
    /**
     * @SWG\Put(
     *     path="/admin/bookings/table/{id}",
     *     tags={"Admin"},
     *     summary="Update the asigned table",
     *     description="",
     *     operationId="api.admin.updateasignedtable",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Booking id",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="table_id",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="update_table_id",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          ),
     *     ),
     *     @SWG\Response(
     *          response=200,
     *          description="successful operation",
     *     ),
     *     @SWG\Response(
     *         response=500,
     *         description="Server Error"
     *     ),
     *     @SWG\Response(
     *         response=400,
     *         description="Logic Error"
     *     )
     * )
     */
    public function updateAsignedTable($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('bookings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $assginedTable = AssignedTables::where(
            'booking_id', '=', $id
        )->where(
            'table_id', '=', $request->table_id
        );

        if ($assginedTable) {
            
            $assginedTable->delete();
            $assigned = new AssignedTables();
            $assigned->table_id = $request->update_table_id;
            $assigned->booking_id = $id;
            $assigned->save();

            $booking = Bookings::find($id);
            $guest = Guest::find($booking->guest_id);
            $this->sendBookingMail($booking, $guest, 'created_booking');

            // Send email & notification to staffs
            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendBookingMailToStaffs($booking, $guest, 'created_booking_admin', $staff_id);
            $this->sendNotification('BookingChanged', $staff_id,  $booking->booking_number, $booking->date, $booking->time, $booking->number_of_people, $booking->status);

            return $this->jsonResponse('STATUS_SUCCESS', $guest, 'assigned_success_update');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'booking_not_found');
        }
    }
}
