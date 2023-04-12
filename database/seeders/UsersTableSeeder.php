<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        if (User::count() == 0) {

            $user = User::create([
                'firstname'      => 'Jafrul',
                'lastname'       => 'Hossain',
                'email'          => 'jafrultripto@gmail.com',
                'password'       => Hash::make('Ewu2013368037'),
                'nid'            => '19943323021000036',
            ]);

            $address = new Address([
                'address'   => 'house-30, Dattapara, Tongi',
                'phone'     => '01832958858',
                'district'  => '41',
                'division'  => '6',
                'upazila'  => '320',
            ]);
            $user->address()->save($address);
            $user->assignRole(['SUDO']);
        }
    }
}
