<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use DB;

class Staff extends Authenticatable
{
    use Notifiable;
    
    protected $table = 'staffs';  

    public function authorizeRoles($roles, $isWrite = 0, $isRead = 0)
    {
        // super user
        if ($this->attributes['role'] == 0 ) 
            return true;

        // Allow for only access request
        if( $isRead == 0 && $isWrite == 0 )
            return true;

        if ($this->hasAnyRole($roles, $isWrite)) {
            return true;
        }
        // abort(401, 'This action is unauthorized.');
        return false;
    }

    public function hasAnyRole($roles, $isWrite)
    {
        if (is_array($roles)) {
            foreach ($roles as $role) {
                if ($this->hasRole($role)) {
                    return true;
                }
            }
        } else {
                if ($this->hasRole($roles, $isWrite)) {
                return true;
            }
        }
        return false;
    }

    public function hasRole($role, $isWrite)
    {
        $permissions = DB::select('select * from staff_permissions, permissions
        where staff_permissions.permission_id = permissions.id
        and staff_id = ?', [$this->attributes['id']]);
        foreach ($permissions as $permission) {
            if ($permission->name == $role && ($isWrite && $permission->is_write || !$isWrite && $permission->is_read))
                return true;
        }
        return false;
    }

    public function setPasswordAttribute($value)
    {
        return $this->attributes['password'] = \Hash::make($value);
    }
}
