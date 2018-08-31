<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Validator;
use \Mandrill;
use Carbon\Carbon;
use App\Models\AssignedTables;
use App\Models\Bookings;
use App\Models\Staff;
use App\Models\Notifications;
use App\Events\EventNotification;

/**
 * @SWG\Swagger(
 *     schemes={"http"},
 *     host="fcc-api.wodebox.com",
 *     basePath="/api",
 *     @SWG\Info(
 *         version="1.0.0",
 *         title="FCC API",
 *         description="This is a online API Documentation for FCC",
 *         @SWG\Contact(
 *             name="CJ"
 *         )
 *     )
 * )
 */

class ApiController extends Controller
{
    protected $messages, $statusCode, $rules, $host, $lang = 'en';

    public function __construct()
    {
        $this->messages=config('messages');
        $this->rules=config('rules');
        $this->statusCode=config('define');
        $this->host="http://$_SERVER[HTTP_HOST]/";
    }

    public function copyObject(&$newObj, $obj) {
        foreach ($obj as $key => $value) {
            $newObj[$key] = $obj[$key];
        }
    }
    public function validationFailResponse1($status, $errors) {
        $status_code = $this->statusCode[$status];
        $data_error = $this->messages[$this->lang]['validation_messages'][$errors];
        return response()->json([
            'return_code' => $status,
            'data' => $data_error
        ], $status_code);
    }   
    public function validationFailResponse($status, $errors) {
        $status_code = $this->statusCode[$status];
        return response()->json([
            'return_code' => $status,
            'data' => $errors
        ], $status_code);
    }

    public function failResponse($status, $errors) {
        $status_code = $this->statusCode[$status];
        $data_error = $this->messages[$this->lang][$errors];
        return response()->json([
            'return_code' => $status,
            'data' => $data_error,
        ], $status_code);
    }

    public function jsonResponse($status, $data, $message = '') {

        $status_code = $this->statusCode[$status];
        $jsonData = array('return_code' => $status);
        if (!empty($message)) {
            $message = $this->messages[$this->lang][$message];
            $jsonData['message'] = $message;
        }
        if ($data !== null)
            $jsonData['data'] = $data;

        return response()->json($jsonData, $status_code);
    }

    public function getLang($lang) {
        return ($lang) ? $lang : $this->lang;
    }

    public function setLang($lang) {
        if ($lang)
            $this->lang = $lang;
    }

    public function checkValidation($request, $rule) {
        $validator = Validator::make($request->all(), $this->rules[$rule], $this->messages[$this->lang]['validation_messages']);
        return $validator;
    }

    public function new_log($id, $activity, $info1, $info2, $logged_at) {
        // $log = new Log();
        // $log->user_id = $id;
        // $log->activity = $activity;
        // $log->info1 = $info1;
        // $log->info2 = $info2;
        // $log->logged_at = $logged_at;
        // $log->save();
    }
    protected function sendBookingMail($booking, $user, $template) {
        
        if(empty($user) || empty($user->email)) return;

        $mail_details = config('mail-templates')[$this->lang][$template];
        array_push($mail_details['variables'], array('name' => 'status', 'content' => $this->messages[$this->lang]['booking_status'][$booking->status]));
        array_push($mail_details['variables'], array('name' => 'booking_number', 'content' => $booking->booking_number));
        array_push($mail_details['variables'], array('name' => 'number_of_people', 'content' => $booking->number_of_people));
        array_push($mail_details['variables'], array('name' => 'notes_by_guest', 'content' => $booking->notes_by_guest));
        if($this->lang == 'cn') {
            array_push($mail_details['variables'], array('name' => 'date', 'content' => Carbon::parse($booking->date)->format('n月j日, Y')));
            array_push($mail_details['variables'], array('name' => 'time', 'content' => str_replace('PM', '下午', str_replace('AM', '上午', Carbon::parse($booking->time)->format('g:i A')))));
        }
        else {
            array_push($mail_details['variables'], array('name' => 'date', 'content' => Carbon::parse($booking->date)->toFormattedDateString()));
            array_push($mail_details['variables'], array('name' => 'time', 'content' => Carbon::parse($booking->time)->format('h:i A')));
        }

        $to = [array(
            'email' => $user->email,
            'name' => $user->name,
            'type' => 'to'
        )];
        $this->sendMail($to, $mail_details['subject'], $template, $mail_details['variables'], []);
    }

    protected function sendBookingMailToStaffs($booking, $user, $template, $staff_id) {

        $staffs = Staff::whereRaw("email_notification=1 and id != '$staff_id'")->get();

        $to = [];
        $merge_vars = [];
        foreach($staffs as $staff) {

            if($staff->authorizeRoles('bookings')) {

                // recipients
                $to[] = array(
                    'email' => $staff->email,
                    'name' => $staff->firstname.' '.$staff->lastname,
                    'type' => 'to'
                );

                if( $staff->language == '' )
                    $staff->language = 'cn';
                // merge_vars
                $mail_details = config('mail-templates')[$staff->language][$template];
                array_push($mail_details['variables'], array('name' => 'status', 'content' => $this->messages[$staff->language]['booking_status'][$booking->status]));
                array_push($mail_details['variables'], array('name' => 'booking_number', 'content' => $booking->booking_number));
                array_push($mail_details['variables'], array('name' => 'number_of_people', 'content' => $booking->number_of_people));
                array_push($mail_details['variables'], array('name' => 'notes_by_guest', 'content' => $booking->notes_by_guest));
                if($staff->language == 'cn') {
                    array_push($mail_details['variables'], array('name' => 'date', 'content' => Carbon::parse($booking->date)->format('n月j日, Y')));
                    array_push($mail_details['variables'], array('name' => 'time', 'content' => str_replace('PM', '下午', str_replace('AM', '上午', Carbon::parse($booking->time)->format('g:i A')))));
                }
                else {
                    array_push($mail_details['variables'], array('name' => 'date', 'content' => Carbon::parse($booking->date)->toFormattedDateString()));
                    array_push($mail_details['variables'], array('name' => 'time', 'content' => Carbon::parse($booking->time)->format('h:i A')));
                }
                array_push($mail_details['variables'], array('name' => 'CURRENT_YEAR', 'content' => Carbon::now()->format('Y')));

                $merge_vars[] = array(
                    'rcpt' => $staff->email,
                    'vars' => $mail_details['variables']
                );
            }
        }

        $this->sendMail($to, 'Notification', $template, [], $merge_vars);
    }
    private function sendMail($to, $subject, $template, $global_merge_vars, $merge_vars) {
        $mandrill = new Mandrill(config('services')['mandrill']['secret']);
        $result = $mandrill->messages->sendTemplate($template, [], array(
            'subject' => $subject,
            'to' => $to,
            'from_email' => env('NOTIFICATION_EMAIL',''),
            'from_name' => env('NOTIFICATION_FROM',''),
            'merge' => true,
            'merge_language' => 'mailchimp',
            'global_merge_vars' => $global_merge_vars,
            'merge_vars' => $merge_vars
        ));
        return $result;
    }

    public function upComingBooking($table_id) {
        return Bookings::Join('assigned_tables', 'assigned_tables.booking_id', '=', 'bookings.id')
        ->where('assigned_tables.table_id', '=', $table_id)
        ->whereRaw('now()<ADDTIME(CONVERT(bookings.date, DATETIME), bookings.time)')
        ->orderByRaw('bookings.date, bookings.time asc')
        ->get();
    }

    // notification
    // 'BookingCreated','BookingChanged','BookingDeleted','GuestCreated','GuestChanged','GuestDeleted','StaffCreated','StaffChanged','StaffDeleted'
    public function sendNotification($type, $created_by, $key_info1 = null, $key_info2 = null, $key_info3 = null, $key_info4 = null, $key_info5 = null) {

        $permission = '';
        if (in_array($type, ['BookingCreated','BookingChanged','BookingDeleted'])) {
            $permission = 'bookings';
        } else if (in_array($type, ['GuestCreated','GuestChanged','GuestDeleted'])) {
            $permission = 'guests';
        } else if (in_array($type, ['StaffCreated','StaffChanged','StaffDeleted'])) {
            $permission = 'staffs';
        }

        $staffs = Staff::all(); 
        foreach ($staffs as $staff) {
            if ($staff->id != $created_by) {

                if($staff->authorizeRoles($permission, 0, 1)) {

                    $notification = new Notifications();
                    $notification->type = $type;
                    $notification->staff_id = $staff->id;   // received staff id
                    $notification->created_by = $created_by;
                    $notification->key_info1 = $key_info1;
                    $notification->key_info2 = $key_info2;
                    $notification->key_info3 = $key_info3;
                    $notification->key_info4 = $key_info4;
                    $notification->key_info5 = $key_info5;
                    $notification->save();
                }
            }
        }

        try {
            $event = array(
                'type'      => $type,
                'created_by'  => $created_by,
                'key_info1' => $key_info1,
                'key_info2' => $key_info2,
                'key_info3' => $key_info3,
                'key_info4' => $key_info4,
                'key_info5' => $key_info5,
            );
            event(new EventNotification( $event));
            return $this->jsonResponse('STATUS_SUCCESS', $event);
            
        } catch(\Exception $e) {
            return $this->failResponse('STATUS_NOT_FOUND', 'notification_not_found');
        }
    }

    public function getNotification($id, Request $request) {

        $this->setLang($request->lang);    
        
        $staff = Staff::find($id); 
        if ($staff) {
                 
            $notifications = Notifications::where('staff_id', '=', $id)
            ->orderBy('created_at', 'desc');
            $all_count = $notifications->count();
            $all_count = $all_count > 100 ? 100 : $all_count;

            if (isset($request->offset)) {
                $cnt = ($request->offset + 20) > $all_count ? $all_count - $request->offset : 20;
                $notifications->offset($request->offset)
                ->limit($cnt);
    
                $next_offset = ($request->offset + 20) > $all_count ? -1 : $request->offset + 20;
            } else {
                $next_offset = -1;
            }

            // ->where('is_read', '=', 0)->get();
            $notifications = $notifications->get();

            $result = array(
                'data' => $notifications,
                'next_offset' => $next_offset,
                'all_count' => $all_count
            );

            return $this->jsonResponse('STATUS_SUCCESS', $result);        
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }
    }

    public function updateNotification($id, Request $request) {

        $staff = Staff::find($id); 
        if ($staff) {      
            $notifications = Notifications::where('staff_id', '=', $id)
            ->where('is_read', '=', 0)
            ->update(['is_read' => 1]);
            return $this->jsonResponse('STATUS_SUCCESS', $notifications);        
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }

        // $id => notification->id
        // $this->setLang($request->lang);  
        // $notification = Notifications::find($id); 
        // if ($notification) {
        //     $notification->is_read = 1;
        //     $notification->save();
        //     return $this->jsonResponse('STATUS_SUCCESS', $notification);            
        // }
        // return $this->failResponse('STATUS_NOT_FOUND', 'notification_not_found');        
    }
}
