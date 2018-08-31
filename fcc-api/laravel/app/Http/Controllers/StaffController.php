<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Staff;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\App;

use JWTAuth;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Providers\User\EloquentUserAdapter;

use Validator;
use Log;
use Carbon\Carbon;

use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;


use Illuminate\Foundation\Auth\SendsPasswordResetEmails;
use Illuminate\Support\Facades\Password;

use App\Models\StaffPermissions;
use App\Models\StaffTables;

class StaffController extends ApiController
{
    protected function broker()
    {
        return Password::broker('users');
    }

    protected function guard()
    {
        return Auth::guard('api_admin');
    }
    
    public function sendResetLinkEmail(Request $request)
    {
        // 
        $this->validate($request, ['email' => 'required|email']);
        
        $response = $this->broker()->sendResetLink(
            $request->only('email')
        );
        
        if ($response == Password::RESET_LINK_SENT)
            return response()->json(['success' => 'true', 'status' => trans($response)]);
        else 
            return response()->json(['error' => 'false', 'status' => trans($response)]);
            
    }

    private function generate_user_response($user)
    {
        // dd($user->with('bookingsCountRelation')->get());
        return [
            'id' => $user->id,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'email' => $user->email,
            'account_name' => $user->account_name,
            // 'notes' => $user->notes,
            'role' => $user->role,
            'phone' => $user->phone,
            'profile_image' => $user->profile_image,
            'table_color' => $user->table_color,
            'is_enabled' => $user->is_enabled,
            'language' => $user->language,
            'email_notification' => $user->email_notification
            // 'created_at' => $user->created_at,
            // 'updated_at' => $user->updated_at

        ];
    }
    
    /*
        STAFF SIGNUP: POST /api/admin/register
    */
    public function register_user(Request $request) {

        $this->setLang($request->lang);

        if (!$request->headers->user->authorizeRoles('staffs', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $lang = $this->getLang($request->lang);

        // validation check
        $validator = Validator::make($request->all(), $this->rules['user_rules'], $this->messages[$lang]['validation_messages']);
        if ($validator->fails()) {
            return $this->validationFailResponse('ERR_PAYLOAD_INVALID', $validator->errors());
        }


        // Save in the database
        $staff = new Staff;
        $staff->firstname = $request->firstname;
        $staff->lastname = $request->lastname;
        $staff->email = $request->email;
        $staff->account_name = $request->account_name;
        $staff->phone = $request->phone;
        $staff->role = $request->role;
        $staff->language = $request->language;
        $staff->table_color = $request->table_color ;
        $staff->setPasswordAttribute($request->password);     
        
        if ($request->profile_image) {

            $png_url = $staff->firstname.time().".png";                
            $path = public_path().'/uploads/' . $png_url;

            $img = $request->profile_image;
            $check = strpos($img, "base64");     

            if ($check) {
                $img = substr($img, strpos($img, ",")+1);
                $data = base64_decode($img);
                $success = file_put_contents($path, $data);
                $staff->profile_image = $this->host.'uploads/'.$png_url;
            }
        }

        $staff->save();

        $this->new_log($staff->id, "Create Staff", $staff->firstname, $staff->lastname, NULL);
        
        // change user model for jwt user provider
        $app = App::getFacadeRoot();
        $app->singleton('tymon.jwt.provider.user', function ($app) {
            $model = $app->make(\App\Models\Staff::class);
            return new EloquentUserAdapter($model);
        });

        $staff->token = JWTAuth::fromUser($staff);
        // $staff->token_expire_at = Carbon::now()->addHour();
        $staff->save();

        if ($request->permissions) {
            foreach ($request->permissions as $_permission) {
                $permissions = new StaffPermissions;
                $permissions->is_write = $_permission["is_write"];
                $permissions->is_read = $_permission["is_read"];
                $permissions->staff_id = $staff->id;
                $permissions->permission_id = $_permission["id"];
                $permissions->save();
            }
        }
        
        $staff['permissions'] = $request->permissions;

        $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
        $this->sendNotification('StaffCreated', $staff_id, $staff->id, $staff->firstname.' '.$staff->lastname, $staff->email, $staff->phone, $staff->account_name);

        return $this->jsonResponse('STATUS_SUCCESS', $staff, 'user_create_success');
    }
    /**
     * @SWG\Post(
     *     path="/admin/login",
     *     tags={"Admin"},
     *     summary="Staff login",
     *     description="",
     *     operationId="api.admin.login",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="login",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="password",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Login successfully"
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
    public function login(Request $request) {

        Auth::shouldUse('api_admin');
        // change user model for jwt user provider
        $app = App::getFacadeRoot();
        $app->singleton('tymon.jwt.provider.user', function ($app) {
            $model = $app->make(\App\Models\Staff::class);
            return new EloquentUserAdapter($model);
        });

        $field = filter_var($request->input('login'), FILTER_VALIDATE_EMAIL) ? 'email' : 'account_name';
        $request->merge([$field => $request->input('login')]);
        $credentials = $request->only($field, 'password');

        $token = JWTAuth::attempt($credentials);

        $this->setLang($request->lang);    

        try {
            if (!$token) {
                return $this->failResponse('STATUS_UNAUTHORIZED', 'login_unauthorized');
            }
        } catch (JWTException $e) {
            return $this->failResponse('STATUS_INTERNAL_SERVER_ERROR', 'login_exception');
        }

        $user = JWTAuth::toUser($token);

        $user->token = $token;
        // $user->token_expire_at = Carbon::now()->addHour();
        $user->save();

        // $this->new_log($user->id, "Login", $this->getUserIP(), NULL, Carbon::now());
        // $refresh_token = JWTAuth::refresh($token);        

        $t = $this->generate_user_response($user);        
        $permissions = StaffPermissions::Join('permissions', 'permission_id', '=', 'permissions.id')
        ->select('staff_permissions.permission_id as id', 
        'staff_permissions.is_write','staff_permissions.is_read', 
        'permissions.name')
        ->whereRaw(
            "staff_id = '$user->id'"
        )->get();

        $t['permissions'] = $permissions;
        $resp = $t;   

        return response()->json([
                'accessToken' => $token,
                'refreshToken' => $token,
                'user' => $resp,                
                'message' => $this->messages['login_success'],
                'status' => $this->statusCode['STATUS_SUCCESS']
        ]);
    }
    public function refresh(Request $request) {

        Auth::shouldUse('api_admin');
        // change user model for jwt user provider
        $app = App::getFacadeRoot();
        $app->singleton('tymon.jwt.provider.user', function ($app) {
            $model = $app->make(\App\Models\Staff::class);
            return new EloquentUserAdapter($model);
        });

        $this->setLang($request->lang);   
        $token = $request->get('refreshToken');
 

        try {
            if (!$token) {
                return $this->failResponse('STATUS_UNAUTHORIZED', 'login_unauthorized');
            }
        } catch (JWTException $e) {
            return $this->failResponse('STATUS_INTERNAL_SERVER_ERROR', 'login_exception');
        }
        $user = JWTAuth::toUser($token);
        // $this->new_log($user->id, "Login", $this->getUserIP(), NULL, Carbon::now());
        // $refresh_token = JWTAuth::refresh($token);        

        return response()->json([
                'accessToken' => $token,
                'refreshToken' => $token,
                'user' => $this->generate_user_response($user),                
                'message' => $this->messages['login_success'],
                'status' => $this->statusCode['STATUS_SUCCESS']
        ]);
    }
    /**
     * @SWG\Get(
     *     path="/admin/staffs",
     *     tags={"Admin"},
     *     summary="Get All staffs",
     *     description="",
     *     operationId="api.admin.getallstaff",
     *     produces={"application/json"},
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
    public function getAllStaff(Request $request)
    {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('staffs')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $search = $request->query('s');    
        if ($search) {
            $staffs = Staff::whereRaw(
                "staffs.firstname like '%$search%'
                or staffs.lastname like '%$search%'
                or staffs.email like '%$search%'
                or staffs.account_name like '%$search%'
                or staffs.phone like '%$search%'"
            )->get();
        } else {
            $staffs = Staff::all();
        }
        $is_assigned = $request->assigned;

        if (count($staffs)) {

            $resp = array();
            foreach ( $staffs as $staff) {
                $t= $this->generate_user_response($staff);
                if ($is_assigned) {
                    if (!isset($request->date)) {
                        $request->date = '';
                    }
                    if (!isset($request->shift_id)) {
                        $request->shift_id = '';
                    }
                    $tables = StaffTables::Join('tables', 'tables.id', '=', 'staff_tables.table_id')
                    ->where('staff_id', '=', $staff->id)
                    ->whereDate('apply_date', '<=', $request->date)
                    ->where('shift_id', '=', $request->shift_id)
                    ->select('tables.id', 'tables.table_name as name')
                    ->get();

                    
                    // get upcoming bookings from table
                    $table['upcoming'] = null;
                    foreach ($tables as $table) {
                        $upcoming = $this->upComingBooking($table->id);
                        $table['upcoming'] = count($upcoming) ? $upcoming[0] : null;
                    }

                    $t['tables'] = $tables;
                } else {
                    $permissions = StaffPermissions::
                    Join('permissions', 'permission_id', '=', 'permissions.id')
                    ->select('staff_permissions.permission_id as id', 
                    'staff_permissions.is_write','staff_permissions.is_read', 
                    'permissions.name')
                    ->whereRaw(
                        "staff_id = '$staff->id'"
                    )->get();
    
                    $t['permissions'] = $permissions;
                }

                $resp[] = $t;
            }

            return $this->jsonResponse('STATUS_SUCCESS', $resp);
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }
    }
    /**
     * @SWG\Get(
     *     path="/admin/staffs/{id}",
     *     tags={"Admin"},
     *     summary="Get a staff by ID",
     *     description="",
     *     operationId="api.admin.getstaff",
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
    public function getStaff($id, Request $request)
    {
        $this->setLang($request->lang);        
        
        if (!$request->headers->user->authorizeRoles('staffs')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }

        $staff = Staff::find($id);
        if ($staff) {         
            $t = $this->generate_user_response($staff);        
            $permissions = StaffPermissions::
            Join('permissions', 'permission_id', '=', 'permissions.id')
            ->select('staff_permissions.permission_id as id', 
            'staff_permissions.is_write','staff_permissions.is_read', 
            'permissions.name')
            ->whereRaw(
                "staff_id = '$staff->id'"
            )->get();

            $t['permissions'] = $permissions;
            $resp = $t;    
            return $this->jsonResponse('STATUS_SUCCESS', $resp);
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/staffs/{id}",
     *     tags={"Admin"},
     *     summary="Delete a staff",
     *     description="",
     *     operationId="api.admin.deletestaff",
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
    public function deleteStaff($id, Request $request)
    {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('staffs', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $staff = Staff::find($id);
        if ($staff) {
            // delete permissions
            StaffPermissions::where('staff_id', '=', $staff->id)->delete();   
            $staff->delete();

            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendNotification('StaffDeleted', $staff_id, $staff->id, $staff->firstname.' '.$staff->lastname, $staff->email, $staff->phone, $staff->account_name);

            return $this->jsonResponse('STATUS_SUCCESS', null, 'user_delete_success');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }    
    }
    /**
     * @SWG\Put(
     *     path="/admin/staffs/{id}",
     *     tags={"Admin"},
     *     summary="Update a staff",
     *     description="",
     *     operationId="api.admin.updatestaff",
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
    public function updateStaff($id, Request $request)
    {
        $auth_user = JWTAuth::parseToken()->toUser();

        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('staffs', 1) && $id != $auth_user->id ) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $staff = Staff::find($id); 
         if ($staff) {
             $validator = $this->checkValidation($request,'user_update_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
            // validation for unique email & phone
            $user = Staff::whereRaw("email = '$request->email' and id != '$id'"
            )->get();
            if (count($user)) {
                return $this->validationFailResponse1('STATUS_NOT_FOUND', 'email.unique');                    
            }
            $user = Staff::whereRaw("phone = '$request->phone' and id != '$id'"
                                    )->get();
            if (count($user)) {
                return $this->validationFailResponse1('STATUS_NOT_FOUND', 'phone.unique');                
            }

            $user = Staff::whereRaw("account_name = '$request->account_name' and id != '$id'"
            )->get();
            if (count($user)) {
                return $this->validationFailResponse1('STATUS_NOT_FOUND', 'account_name.unique');                
            }    

             $this->copyObject($staff, $request->except('lang', 'token', 'profile_image', 'password', 'permissions'));

             if ($request->profile_image) {

                $png_url = $staff->firstname.time().".png";                
                $path = public_path().'/uploads/' . $png_url;

                $img = $request->profile_image;
                $check = strpos($img, "base64");     

                if ($check) {
                    $img = substr($img, strpos($img, ",")+1);
                    $data = base64_decode($img);
                    $success = file_put_contents($path, $data);
                    $staff->profile_image = $this->host.'uploads/'.$png_url;
                }
            }
            if ($request->password) {
                $staff->setPasswordAttribute($request->password);
            }
            $staff->save();
            if ($request->permissions) {
                StaffPermissions::where('staff_id', '=', $staff->id)->delete();
                foreach ($request->permissions as $_permission) {
                    $permissions = new StaffPermissions;
                    $permissions->is_write = $_permission["is_write"];
                    $permissions->is_read = $_permission["is_read"];
                    $permissions->staff_id = $staff->id;
                    $permissions->permission_id = $_permission["id"];
                    $permissions->save();
                }
            }

            $staff_id = $request->headers->user_type == 'STAFF' ? $request->headers->user->id : 0;
            $this->sendNotification('StaffChanged', $staff_id, $staff->id, $staff->firstname.' '.$staff->lastname, $staff->email, $staff->phone, $staff->account_name);

            return $this->jsonResponse('STATUS_SUCCESS', null, 'user_update_success');
        } else {
        return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }
    }
    /**
     * @SWG\Put(
     *     path="/admin/staffs/table/{id}",
     *     tags={"Admin"},
     *     summary="Assigned tables to a staff",
     *     description="",
     *     operationId="api.admin.assignedtables",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Staff ID",
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
     *                  property="tables",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          )
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
    public function assignedTableToStaff($staff_id, Request $request)
    {
        $this->setLang($request->lang);    

        if (!$request->headers->user->authorizeRoles('staffs', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }

        $staff = Staff::find($staff_id); 
        if ($staff) {
            // table ids
            $tables = $request->tables;
            // remove all tables
            StaffTables::where('staff_id', '=', $staff_id)->delete();

            foreach ($tables as $table) {
                $assigned = new StaffTables;
                $assigned->staff_id = $staff_id;
                $assigned->table_id = $table['table_id'];
                $assigned->apply_date = $table['apply_date'];
                $assigned->shift_id = $table['shift_id'];
                $assigned->save();
            }
            return $this->jsonResponse('STATUS_SUCCESS', null, 'table_assigned_success');            
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');            
        }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/staffs/table/{id}",
     *     tags={"Admin"},
     *     summary="Assigned tables to a staff",
     *     description="",
     *     operationId="api.admin.assignedtables",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Staff ID",
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
    public function removeAllTablesFromStaff($id, Request $request)
    {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('staffs', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $staff = Staff::find($id); 
        if ($staff) {
            // remove all tables
            StaffTables::where('staff_id', '=', $id)->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'table_clear_success');            
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');            
        }
    }

    public function changeColorOfStaff($id, Request $request)
    {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('staffs', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $staff = Staff::find($id); 
        if ($staff) {
            $staff->table_color = $request->table_color;
            $staff->save();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'user_update_success');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'user_not_found');
        }
    }

    public function setStaffPermission(Request $request)
    {
        
    }

    public function get_logs(Request $request)
    {
        
    }
}
