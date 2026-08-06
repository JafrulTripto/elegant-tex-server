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
    $this->seedUser('jafrultripto@gmail.com', 'Jafrul', 'Hossain', 'Ewu2013368037', '19943323021000036', 'SUDO');
    $this->seedUser('dadarakib@gmail.com', 'Meer', 'Rakibuzzaman', 'Rakib1234', '123456789', 'Admin');
  }

  /** Idempotent: only creates the user (and its address/role) if the email is new. */
  private function seedUser(string $email, string $firstname, string $lastname, string $password, string $nid, string $role): void
  {
    $user = User::firstOrCreate(
      ['email' => $email],
      [
        'firstname' => $firstname,
        'lastname' => $lastname,
        'password' => Hash::make($password),
        'nid' => $nid,
      ]
    );

    if (!$user->wasRecentlyCreated) {
      return;
    }

    $user->address()->save(new Address([
      'address' => 'house-30, Dattapara, Tongi',
      'phone' => '01832958858',
      'district' => '41',
      'division' => '6',
      'upazila' => '320',
    ]));
    $user->assignRole([$role]);
  }
}
