<?php

return [

    'settings_general_rules' => array(
            // 'DefaultShiftPackage' => 'required|integer',
            // 'DefaultFloorPackage' => 'required|integer',
            'BookingAppTimer' => 'required|integer',
            'MaximumNumberofPeoplePerBooking' => 'required|integer',
            'MinimumNumberofPeoplePerBooking' => 'required|integer|min_if:MaximumNumberofPeoplePerBooking',
            'EarliestBookingAllowedinAdvance' => 'required|integer'
        ),

    'rule_rules' => array(
            'name' => 'required',
            'start' => 'required',
            'end' => 'required',
            'repeat' => 'required|list:repeat_list',
            // 'shift_package_id' => 'required'
        ),

    'shift_package_rules' => array(
            'name' => 'required',
            'is_publish' => 'required|integer'
        ),

    'shift_rules' => array(
            'name' => 'required',
            'time_slots' => 'required|array',
            'floor_package_id' => 'required|integer',
            'shift_package_id' => 'required|integer',
            'shift_atb' => 'required|float',
            'is_enabled' => 'required|integer'
        ),

    'floor_package_rules' => array(
            'name' => 'required',
            'is_publish' => 'required|integer'
        ),

    'floor_rules' => array(
            'name' => 'required',
            'number' => 'required|integer|unique:floors',
        ),

    'table_rules' => array(
            'table_name' => 'required',
            'seats' => 'required|integer',
            'seat_from' => 'required|integer',
            'seat_to' => 'required|integer',
            'style' => 'required|integer',
            'floor_id' => 'required|integer',
            'floor_package_id' => 'required|integer',
            // 'non_reservable' => 'required|integer',
            // 'table_layout' => 'required'
        ),
    'block_table_rules' => array(
        'table_id' => 'required',
        'block_date' => 'required',
        'is_allday' => 'required|integer',
        'time_range_from' => 'required',
        'time_range_to' => 'required',
    ),
    'table_draw_rules' => array(
            'table_layout' => 'required'
        ),

    'booking_rules' => array(
            'date' => 'required',
            'time' => 'required',
            'hours' => 'required',
            'number_of_people' => 'required|integer',
            'guest_id' => 'required|integer',
            'status' => 'required|list:booking_status',
            'shift_package_id' => 'required|integer',
            'shift_id' => 'required|integer',
            'floor_package_id' => 'required|integer'
        ),

    'booking_guest_rules' => array(
            'date' => 'required',
            'time' => 'required',
            'hours' => 'required',
            'num_of_people' => 'required|integer',
            'status' => 'required|list:booking_status'
        ),
    'dinner_rules' => array(
            'deposit_amount.rmb' => 'required|numeric',
            'deposit_amount.hkd' => 'required|numeric',
            'one_seat_number' => 'required|integer',
            'forth_seats_number' => 'required|integer',
            'time_slots' => 'required|array'
        ),

    'rule_all_day_rules' => array(
            'start' => 'required',
            'end' => 'required',
            'repeat' => 'required|list:repeat_list',
            'one_seat_tables' => 'required|numeric',
            'four_seats_tables' => 'required|numeric'
        ),

    'user_rules' => array(
            'firstname' => 'required|min:1',
            'lastname' => 'required',
            'email' => 'required|email|unique:staffs,email',
            'account_name' => 'required|unique:staffs',
            'password' => 'required',
            'phone' => 'required|phone|unique:staffs,phone',
            'role' => 'required'
        ),

    'user_update_rules' => array(
            'firstname' => 'required|min:1',
            'role' => 'required'
        ),

    'guest_rules' => array(
            'name' => 'required|min:1',
            'email' => 'required|email|unique:guests,email',
            'phone' => 'required|phone|unique:guests,phone'
        ),

    'guest_update_rules' => array(
            'name' => 'required|min:1',
            'email' => 'required|email',
            'phone' => 'required|phone'
        ),
    'sms_rules' => array(
            'phone' => 'required|phone',
        ),
    'available_table_rules' => array(
            'date' => 'required',
            'time' => 'required',
            'seats' => 'required|numeric',            
        ),

    'change_password_rules' => array(
            'old_password' => 'required',
            'new_password' => 'required'
        ),

    'repeat_list' => ['none', 'everyDay', 'everyWeek', 'everyMonth', 'everyYear'],
    'booking_status' => ['Booked', 'Confirmed', 'Partially seated', 'Seated', 'Not arrived yet', 'Waiting in bar', 'Got the check', 'Completed', 'No show', 'Cancel', 'Cancel & Refund'],

    'status' => ['confirmed', 'waiting', 'cancelled'],
    'booking_type' => ['v1', 'v2', 'v3'],
    'table_type' => ['1', '4'],
    'payment_status' => ['Not Paid', 'Paid Pending', 'Paid Failed', 'Paid', 'Refunded', 'Refunded Pending', 'Refunded Failed'],
    'currency' => ['hkd', 'rmb'],
    'payment_method' => ['alipay', 'wechat', 'paypal', 'cash']
];