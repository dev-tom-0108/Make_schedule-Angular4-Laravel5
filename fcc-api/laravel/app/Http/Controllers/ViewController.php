<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use DB;

class ViewController extends Controller
{
    public function index() {
    	$users = DB::select('select * from staff_permissions');
    	return view('view', ['users'=>$users]);
    }
}
