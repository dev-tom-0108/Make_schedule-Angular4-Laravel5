<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Settings;
use App\Models\Rules;
use App\Models\ShiftPackages;
use App\Models\Shifts;
use App\Models\FloorPackages;
use App\Models\Floors;
use App\Models\Tables;
use App\Models\Tags;
use App\Models\Permissions;
use App\Models\BlockTables;

class SettingsController extends ApiController
{
    // Update the Default Shift Package Setting
    /**
     * @SWG\Put(
     *     path="/admin/settings/general/shiftpackage/{id}",
     *     tags={"Admin"},
     *     summary="Update the default shift package",
     *     description="",
     *     operationId="api.admin.updatedefaultshiftpackage",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Default Shift Package ID",
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
    public function updateGeneralDefaultShiftPackage($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $general_settings = Settings::all();
        $shift_package = ShiftPackages::find($id); 
        if (!$shift_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'shift_package_not_found');
        }
        if(count($general_settings)) {

            
            foreach ($general_settings as $setting_item) {
                if ($setting_item['key'] == 'DefaultShiftPackage') {
                    $setting_item['value'] = $id;
                    $setting_item->save();   
                    break;  
                }
            }
            return $this->jsonResponse('STATUS_SUCCESS', null, 'settings_success_update');
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'settings_not_found');
        }
    }
    // Update the Default Floor Package Setting
    /**
     * @SWG\Put(
     *     path="/admin/settings/general/floorpackage/{id}",
     *     tags={"Admin"},
     *     summary="Update the default floor package",
     *     description="",
     *     operationId="api.admin.updatedefaultfloorpackage",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Default Floor Package ID",
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
    public function updateGeneralDefaultFloorPackage($id, Request $request) {

        $this->setLang($request->lang);

        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }

        $general_settings = Settings::all();
        $floor_package = FloorPackages::find($id);

        if (!$floor_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'floor_package_not_found');
        }
        
        if(count($general_settings)) {

            foreach ($general_settings as $setting_item) {
                if ($setting_item['key'] == 'DefaultFloorPackage') {
                    $setting_item['value'] = $id;
                    $setting_item->save();   
                    break;  
                }
            }
            return $this->jsonResponse('STATUS_SUCCESS', null, 'settings_success_update');
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'settings_not_found');
        }
    }
    // General Settings
    /**
     * @SWG\Get(
     *     path="/admin/settings/general",
     *     tags={"Admin"},
     *     summary="Get general settings",
     *     description="",
     *     operationId="api.admin.getgeneralsettings",
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
    public function getGeneralSettings(Request $request) {

        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $general_settings = Settings::select('key', 'value')->get();
        if(count($general_settings)) {
            $data = array();
            foreach ($general_settings as $setting_item) {
                $data[$setting_item['key']] = $setting_item['value'];
            }
            return $this->jsonResponse('STATUS_SUCCESS', $data);
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'settings_not_found');
        }
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/general",
     *     tags={"Admin"},
     *     summary="Update a staff",
     *     description="",
     *     operationId="api.admin.updatestaff",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *              @SWG\Property(
     *                  property="DefaultShiftPackage",
     *                  type="integer",
     *                  default="1",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="DefaultFloorPackage",
     *                  type="integer",
     *                  default="1",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="BookingAppTimer",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="MaximumNumberofPeoplePerBooking",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="MinimumNumberofPeoplePerBooking",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="EarliestBookingAllowedinAdvance",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *      ),
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
    public function updateGeneralSettings(Request $request) {
        $this->setLang($request->lang); 
        $general_settings = Settings::all();
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        if(count($general_settings)) {

            // validation
            $validator = $this->checkValidation($request,'settings_general_rules');

            if ($validator->fails()) {
                return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
            }
            
            foreach ($general_settings as $setting_item) {
                if ($request[$setting_item['key']]) {
                    $setting_item['value'] = $request[$setting_item['key']];
                    $setting_item->save();    
                }        
            }

            return $this->jsonResponse('STATUS_SUCCESS', null, 'settings_success_update');
        }
        else {
            return $this->failResponse('STATUS_NOT_FOUND', 'settings_not_found');
        }
    }

    // Rules
    /**
     * @SWG\Post(
     *     path="/admin/settings/rules",
     *     tags={"Admin"},
     *     summary="Create a rule",
     *     description="",
     *     operationId="api.admin.createrules",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="start",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="end",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="repeat",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a rule successfully"
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
    public function createRule(Request $request) {

        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        // validation
        $validator = $this->checkValidation($request,'rule_rules');

        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $rule = new Rules();
        $this->copyObject($rule, $request->except('lang', 'token'));
        $rule->save();

        return $this->jsonResponse('STATUS_SUCCESS', $rule, 'rule_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/rules",
     *     tags={"Admin"},
     *     summary="Get all rules",
     *     description="",
     *     operationId="api.admin.getallrules",
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
    public function getRules(Request $request) {

        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $rules = Rules::query()->get();
        return $this->jsonResponse('STATUS_SUCCESS', $rules, 'rule_success_load');        
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/rules/{id}",
     *     tags={"Admin"},
     *     summary="Update a rule",
     *     description="",
     *     operationId="api.admin.updaterule",
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
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="start",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="end",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="repeat",
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
    public function updateRule($id, Request $request) {

        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $rule = Rules::find($id); 
        if ($rule) {
            $validator = $this->checkValidation($request,'rule_rules');
            if ($validator->fails()) {
                return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
            }
            $this->copyObject($rule, $request->except('lang', 'token'));
            $rule->save();
            return $this->jsonResponse('STATUS_SUCCESS', $rule, 'rule_success_update');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'rule_not_found');
        }       
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/rules/{id}",
     *     tags={"Admin"},
     *     summary="Delete a rule",
     *     description="",
     *     operationId="api.admin.deleterule",
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
    public function deleteRule($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $rule = Rules::find($id);
        if ($rule) {
            $rule->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'rule_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'rule_not_found');
        }         
    }

    // Shift Package
    /**
     * @SWG\Post(
     *     path="/admin/settings/shift_packages",
     *     tags={"Admin"},
     *     summary="Create a shift package",
     *     description="",
     *     operationId="api.admin.createshiftpackages",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_publish",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a shfit package successfully"
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
    public function createShiftPackage(Request $request) {
        
        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'shift_package_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $shiftPackage = new ShiftPackages();
        $this->copyObject($shiftPackage, $request->except('lang', 'token'));
        $shiftPackage->save();

        return $this->jsonResponse('STATUS_SUCCESS', $shiftPackage, 'shift_package_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/shift_packages",
     *     tags={"Admin"},
     *     summary="Get all shift packages",
     *     description="",
     *     operationId="api.admin.getallshiftpackages",
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
    public function getShiftPackages(Request $request) {
        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shift_packages = ShiftPackages::query()->get();
        return $this->jsonResponse('STATUS_SUCCESS', $shift_packages, 'shift_package_success_load');  
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/shift_packages/{id}",
     *     tags={"Admin"},
     *     summary="Update a shift packages",
     *     description="",
     *     operationId="api.admin.updateshiftpackages",
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
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_publish",
     *                  type="integer",
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
    public function updateShiftPackages($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $shift_package = ShiftPackages::find($id); 
         if ($shift_package) {
             $validator = $this->checkValidation($request,'shift_package_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($shift_package, $request->except('lang', 'token'));
             $shift_package->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_package_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'shift_package_not_found');
         }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/shift_packages/{id}",
     *     tags={"Admin"},
     *     summary="Delete a shiftpackages",
     *     description="",
     *     operationId="api.admin.deleteshiftpackages",
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
    public function deleteShiftPackages($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shift_package = ShiftPackages::find($id);
        if ($shift_package) {
            Shifts::where('shift_package_id', '=', $id)->delete();
            $shift_package->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_package_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'shift_package_not_found');
        }         
    }
    // Shift
    /**
     * @SWG\Post(
     *     path="/admin/settings/shifts",
     *     tags={"Admin"},
     *     summary="Create a shift",
     *     description="",
     *     operationId="api.admin.createshift",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="time_slots",
     *                  type="json",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="floor_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="shift_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="shift_atb",
     *                  type="float",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_enabled",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a shfit successfully"
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
    public function createShift(Request $request) {
        
        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'shift_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $shift = new Shifts();
        $this->copyObject($shift, $request->except('lang', 'token'));
        $shift->time_slots = json_encode($shift->time_slots);
        $shift->save();

        return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/shifts/{id}",
     *     tags={"Admin"},
     *     summary="Get the shifts by shift package id",
     *     description="",
     *     operationId="api.admin.getshifts",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Shift Package ID",
     *          required=true,
     *          type="string"
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
    public function getShifts($id, Request $request) {

        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shift_package = ShiftPackages::find($id); 
        if (!$shift_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'shift_package_not_found');
        }

        // id must be shift pacakge id
        $shifts = Shifts::whereRaw(
            "shifts.shift_package_id = '$id'"                
        )->get();

        foreach ( $shifts as &$shift) {
            $shift->time_slots = json_decode($shift->time_slots);
        }
        if (count($shifts)) {
            return $this->jsonResponse('STATUS_SUCCESS', $shifts, 'shift_success_load');            
        }
        return $this->failResponse('STATUS_NOT_FOUND', 'shift_not_found');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/shifts",
     *     tags={"Admin"},
     *     summary="Get all shifts",
     *     description="",
     *     operationId="api.admin.getallshifts",
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
    public function getAllShifts(Request $request) {

        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shifts = Shifts::query()->get();
        foreach ( $shifts as &$shift) {
            $shift->time_slots = json_decode($shift->time_slots);
        }
        return $this->jsonResponse('STATUS_SUCCESS', $shifts, 'shift_success_load'); 
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/shifts/{id}",
     *     tags={"Admin"},
     *     summary="Update a shift",
     *     description="",
     *     operationId="api.admin.updateshifts",
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
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="time_slots",
     *                  type="json",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="floor_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="shift_package_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="shift_atb",
     *                  type="float",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_enabled",
     *                  type="integer",
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
    public function updateShifts($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $shift = Shifts::find($id); 
         if ($shift) {
             $validator = $this->checkValidation($request,'shift_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($shift, $request->except('lang', 'token'));
             $shift->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'shift_not_found');
         }
    }
/**
     * @SWG\Put(
     *     path="/admin/settings//shifts/package/{id}",
     *     tags={"Admin"},
     *     summary="Update the shifts for shift package id",
     *     description="",
     *     operationId="api.admin.updateshiftsforshiftpackageid",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Shift Package ID",
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
     *                  property="data",
     *                  type="json",
     *                  default="",
     *                  example="",
     *              ),
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
    public function updateShiftsForPackageID($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shift_package = ShiftPackages::find($id); 
        if (!$shift_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'shift_package_not_found');
        }
        
        // id must be shift pacakge id
        $shifts = Shifts::whereRaw(
            "shifts.shift_package_id = '$id'"                
        )->delete();

        // data
        $data = $request->data;
        foreach ( $data as $shift_data) {
            $shift = new Shifts();
            $this->copyObject($shift, $shift_data);
            $shift->time_slots = json_encode($shift->time_slots);
            $shift->save();
        }

        return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_success_update');
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/shifts/{id}",
     *     tags={"Admin"},
     *     summary="Delete a shift",
     *     description="",
     *     operationId="api.admin.deleteshifts",
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
    public function deleteShifts($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $shift = Shifts::find($id);
        if ($shift) {
            $shift->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'shift_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'shift_not_found');
        }         
    }
    
    // Floor Package
    /**
     * @SWG\Post(
     *     path="/admin/settings/floor_packages",
     *     tags={"Admin"},
     *     summary="Create a floor package",
     *     description="",
     *     operationId="api.admin.createfloorpackages",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_publish",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a floor package successfully"
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
    public function createFloorPackage(Request $request) {
        
        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'floor_package_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $floor_package = new FloorPackages();
        $this->copyObject($floor_package, $request->except('lang', 'token'));
        $floor_package->save();

        return $this->jsonResponse('STATUS_SUCCESS', $floor_package, 'floor_package_success_create');
    }
     /**
     * @SWG\Get(
     *     path="/admin/settings/floor_packages",
     *     tags={"Admin"},
     *     summary="Get all floor packages",
     *     description="",
     *     operationId="api.admin.getallfloorpackages",
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
    public function getFloorPackages(Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor_package = FloorPackages::query()->get();
        return $this->jsonResponse('STATUS_SUCCESS', $floor_package, 'floor_package_success_load');  
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/floor_packages/{id}",
     *     tags={"Admin"},
     *     summary="Update a shift packages",
     *     description="",
     *     operationId="api.admin.updateshiftpackages",
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
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_publish",
     *                  type="integer",
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
    public function updateFloorPackages($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $floor_package = FloorPackages::find($id); 
         if ($floor_package) {
             $validator = $this->checkValidation($request,'floor_package_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($floor_package, $request->except('lang', 'token'));
             $floor_package->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'floor_package_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'floor_package_not_found');
         }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/floor_packages/{id}",
     *     tags={"Admin"},
     *     summary="Delete a floor package",
     *     description="",
     *     operationId="api.admin.deletefloorpackages",
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
    public function deleteFloorPackages($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor_package = FloorPackages::find($id);
        if ($floor_package) {
            $floor_package->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'floor_package_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'floor_package_not_found');
        }         
    }

    // Floor
    /**
     * @SWG\Post(
     *     path="/admin/settings/floors",
     *     tags={"Admin"},
     *     summary="Create a floor",
     *     description="",
     *     operationId="api.admin.createfloor",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
     *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="number",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              )
     *          )
     *     ),
     *     @SWG\Response(
     *         response=200,
     *         description="Created a floor successfully"
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
    public function createFloor(Request $request) {
        
        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'floor_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $floor = new Floors();
        $this->copyObject($floor, $request->except('lang', 'token'));
        $floor->save();

        return $this->jsonResponse('STATUS_SUCCESS', null, 'floor_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/floors",
     *     tags={"Admin"},
     *     summary="Get all floors",
     *     description="",
     *     operationId="api.admin.getallfloors",
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
    public function getFloors(Request $request) {
        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('settings') && !$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor = Floors::query()->get();
        return $this->jsonResponse('STATUS_SUCCESS', $floor, 'floor_success_load');  
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/floors/{id}",
     *     tags={"Admin"},
     *     summary="Update a floor",
     *     description="",
     *     operationId="api.admin.updatefloor",
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
     *                  property="name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="number",
     *                  type="integer",
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
    public function updateFloors($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $floor = Floors::find($id); 
         if ($shift) {
             $validator = $this->checkValidation($request,'floor_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($floor, $request->except('lang', 'token'));
             $floor->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'floor_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'floor_not_found');
         }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/floors/{id}",
     *     tags={"Admin"},
     *     summary="Delete a floor",
     *     description="",
     *     operationId="api.admin.deletefloor",
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
    public function deleteFloors($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor = Floors::find($id);
        if ($floor) {
            $floor->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'floor_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'floor_not_found');
        }         
    }

    // Tables
    /**
     * @SWG\Post(
     *     path="/admin/settings/tables",
     *     tags={"Admin"},
     *     summary="Create a table",
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
     *                  property="table_number",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="table_name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seats",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seat_from",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seat_to",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="style",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="floor_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
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
    public function createTable(Request $request) {
        
        $this->setLang($request->lang);      
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'table_rules');
        
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }

        $table = new Tables();
        $this->copyObject($table, $request->except('lang', 'token'));
        if ( $request->table_layout) {
            $table->table_layout = json_encode($table->table_layout);
         }
        $table->save();

        return $this->jsonResponse('STATUS_SUCCESS', $table, 'table_success_create');
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/tables",
     *     tags={"Admin"},
     *     summary="Get all tables",
     *     description="",
     *     operationId="api.admin.getalltables",
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
    public function getTables(Request $request) {
        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('settings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $tables = Tables::query()->get();
        foreach ( $tables as $table) {
            $table->table_layout = json_decode($table->table_layout);
        }
        return $this->jsonResponse('STATUS_SUCCESS', $tables, 'table_success_load');  
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/tables/package/{id}",
     *     tags={"Admin"},
     *     summary="Get all tables by package id",
     *     description="",
     *     operationId="api.admin.getalltablesbypackageid",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Package ID",
     *          required=true,
     *          type="string"
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
    public function getTablesByPackageID($id, Request $request) {
        $this->setLang($request->lang);        
        if (!$request->headers->user->authorizeRoles('settings') && !$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor_package = FloorPackages::find($id); 
        if (!$floor_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'floor_package_not_found');
        }
        $tables = Tables::
        // select('tables.*','floors.number', 'floors.name as floor_name')
        // ->Join('floors', 'floors.id', '=', 'floor_id')
        // ->
        WhereRaw(
            "floor_package_id = '$id'"
        )->get();
        foreach ( $tables as $table) {
            $table->table_layout = json_decode($table->table_layout);
        }
        return $this->jsonResponse('STATUS_SUCCESS', $tables, 'table_success_load');  
    }
    /**
     * @SWG\Put(
     *     path="/admin/settings/tables/{id}",
     *     tags={"Admin"},
     *     summary="Update a table",
     *     description="",
     *     operationId="api.admin.updatetable",
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
     *                  property="table_number",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="table_name",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seats",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seat_from",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="seat_to",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="style",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="floor_id",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
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
    public function updateTables($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $table = Tables::find($id); 
         if ($table) {
             $validator = $this->checkValidation($request,'table_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($table, $request->except('lang', 'token'));
             if ( $request->table_layout) {
                $table->table_layout = json_encode($table->table_layout);
             }

             $table->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'table_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'table_not_found');
         }
    }
    /**
     * @SWG\Post(
     *     path="/admin/settings/tables/block",
     *     tags={"Admin"},
     *     summary="Block a table",
     *     description="",
     *     operationId="api.admin.blocktable",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          in="body",
     *          name="body",
     *          description="",
     *          required=true,
    *          @SWG\Schema(
     *              type="object",
     *             @SWG\Property(
     *                  property="block_date",
     *                  type="string",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="is_allday",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="time_range_from",
     *                  type="integer",
     *                  default="",
     *                  example="",
     *              ),
     *             @SWG\Property(
     *                  property="time_range_to",
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
    public function blockTable(Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $validator = $this->checkValidation($request,'block_table_rules');
        if ($validator->fails()) {
            return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
        }
        $table = Tables::find($request->table_id);
        if ($table) {
            BlockTables::where('table_id', '=', $request->table_id)
            ->where('block_date', '=', $request->block_date)->delete();
            $blocktable = new BlockTables();
            $this->copyObject($blocktable, $request->except('lang', 'token'));
            $blocktable->save();
            return $this->jsonResponse('STATUS_SUCCESS', $blocktable, 'table_success_update');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'table_not_found');
        }
    }
    /**
     * @SWG\Post(
     *     path="/admin/settings/tables/unblock/{id}",
     *     tags={"Admin"},
     *     summary="Unblock a table",
     *     description="",
     *     operationId="api.admin.unblocktable",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Table id",
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
    public function unblockTable($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $table = Tables::find($id);
        if ($table) {
            BlockTables::where('table_id', '=', $id)
            ->where('block_date', '=', $request->date)->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'unblocked_table_success');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'table_not_found');
        }
    }
    /**
     * @SWG\Delete(
     *     path="/admin/settings/tables/{id}",
     *     tags={"Admin"},
     *     summary="Delete a table",
     *     description="",
     *     operationId="api.admin.deletetable",
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
    public function deleteTables($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $table = Tables::find($id);
        if ($table) {
            $table->delete();
            return $this->jsonResponse('STATUS_SUCCESS', null, 'table_success_delete');
        } else {
            return $this->failResponse('STATUS_NOT_FOUND', 'table_not_found');
        }         
    }

    /**
     * @SWG\Put(
     *     path="/admin/settings/table_draw_data/{id}",
     *     tags={"Admin"},
     *     summary="Update a table drawing data",
     *     description="",
     *     operationId="api.admin.updatetabledrawdata",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="ID",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          in="query",
     *          name="table_layout",
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
    public function updateTableDrawData($id, Request $request) {
        $this->setLang($request->lang);    
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
         $table = Tables::find($id); 
         if ($table) {
             $validator = $this->checkValidation($request,'table_draw_rules');
             if ($validator->fails()) {
                 return $this->validationFailResponse('STATUS_LOGIC_ERROR', $validator->errors());
             }
             $this->copyObject($table, $request->except('lang', 'token'));
             $table->save();
             return $this->jsonResponse('STATUS_SUCCESS', null, 'table_success_update');
         } else {
             return $this->failResponse('STATUS_NOT_FOUND', 'table_not_found');
         }
    }

    /**
     * @SWG\Put(
     *     path="/admin/settings/tables/package/{id}",
     *     tags={"Admin"},
     *     summary="Update tables by floor package id",
     *     description="",
     *     operationId="api.admin.updatetablesfloorpackageid",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="id",
     *          in="path",
     *          description="Floor Package ID",
     *          required=true,
     *          type="string"
     *     ),
     *     @SWG\Parameter(
     *          in="query",
     *          name="data",
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
    public function upgradeTablesByPackageID($id, Request $request) {
        $this->setLang($request->lang);
        if (!$request->headers->user->authorizeRoles('settings', 1)) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $floor_package = FloorPackages::find($id); 
        if (!$floor_package) {
            return $this->failResponse('STATUS_NOT_FOUND', 'floor_package_not_found');
        }

        // delete all tables by floor package id
        Tables::where('floor_package_id', '=', $id)->delete();
        // data
        $data = $request->data;
        foreach ( $data as $table_data) {
            $table = new Tables();
            $this->copyObject($table, $table_data);
            $table->table_layout = json_encode($table->table_layout);
            $table->save();
        }

        return $this->jsonResponse('STATUS_SUCCESS', null, 'table_success_update');
   
    }

    // Get All Settings(rules & general)
    /**
     * @SWG\Get(
     *     path="/app/settings",
     *     tags={"Guests"},
     *     summary="Get settings(Rules & General)",
     *     description="",
     *     operationId="api.guest.settings",
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
    public function getRulesAndGeneralSettings(Request $request) {

        $rules = Rules::query()
        ->orderByRaw("rules.created_at desc")
        ->get();
        $general_settings = Settings::select('key', 'value')->get();
        $this->setLang($request->lang);
        $data = array();
        if(count($general_settings)) {
            foreach ($general_settings as $setting_item) {
                $data[$setting_item['key']] = $setting_item['value'];
            }
        }
        $response = array(
            'rules' => $rules,
            'general' => $data
        );

        return $this->jsonResponse('STATUS_SUCCESS', $response); 
    }

    /**
     * @SWG\Get(
     *     path="/admin/settings/tags",
     *     tags={"Admin"},
     *     summary="Get all tags",
     *     description="",
     *     operationId="api.admin.getalltags",
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
    public function getTags(Request $request) {
        $this->setLang($request->lang);        
        $tags = Tags::all();
        return $this->jsonResponse('STATUS_SUCCESS', $tags, 'table_success_load');  
    }
    /**
     * @SWG\Get(
     *     path="/admin/settings/permissions",
     *     tags={"Admin"},
     *     summary="Get all permissions",
     *     description="",
     *     operationId="api.admin.getallpermissions",
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
    public function getPermissions(Request $request) {
        $this->setLang($request->lang);        
        $permissions = Permissions::select('id', 'name')->get();
        return $this->jsonResponse('STATUS_SUCCESS', $permissions, 'table_success_load');  
    }

        /**
     * @SWG\Get(
     *     path="/admin/settings/tables/block",
     *     tags={"Admin"},
     *     summary="Get all block tables",
     *     description="",
     *     operationId="api.admin.getallblocktables",
     *     produces={"application/json"},
     *     @SWG\Parameter(
     *          name="date",
     *          in="path",
     *          description="date",
     *          required=true,
     *          type="string"
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
    public function getBlockTables(Request $request) {
        $this->setLang($request->lang);   
        if (!$request->headers->user->authorizeRoles('settings') && !$request->headers->user->authorizeRoles('bookings')) {
            return $this->failResponse('STATUS_FORRBIDDEN', 'user_not_permission');
        }
        $blocked = BlockTables::where('block_date', '=', $request->date)->get();
        return $this->jsonResponse('STATUS_SUCCESS', $blocked, 'table_success_load');  
    }
}
