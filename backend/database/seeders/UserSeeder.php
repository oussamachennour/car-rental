<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            // Managers
            [
                'name'       => 'Marie Leclerc',
                'email'      => 'manager@carrental.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 1 40 55 66 77',
                'role'       => 'manager',
                'is_student' => false,
                'avatar'     => null,
            ],
            [
                'name'       => 'Thomas Bernard',
                'email'      => 'thomas@carrental.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 6 12 33 44 55',
                'role'       => 'manager',
                'is_student' => false,
                'avatar'     => null,
            ],
            // Clients
            [
                'name'       => 'Alex Martin',
                'email'      => 'alex@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 6 12 34 56 78',
                'role'       => 'client',
                'is_student' => true,
                'avatar'     => null,
            ],
            [
                'name'       => 'Jean Dupont',
                'email'      => 'jean@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 6 98 76 54 32',
                'role'       => 'client',
                'is_student' => false,
                'avatar'     => null,
            ],
            [
                'name'       => 'Sarah Müller',
                'email'      => 'sarah@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+49 30 555 1234',
                'role'       => 'client',
                'is_student' => true,
                'avatar'     => null,
            ],
            [
                'name'       => 'Carlos Rodríguez',
                'email'      => 'carlos@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+34 91 555 0000',
                'role'       => 'client',
                'is_student' => false,
                'avatar'     => null,
            ],
            [
                'name'       => 'Amira Benali',
                'email'      => 'amira@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 6 22 33 44 55',
                'role'       => 'client',
                'is_student' => true,
                'avatar'     => null,
            ],
            [
                'name'       => 'Lucas Petit',
                'email'      => 'lucas@example.com',
                'password'   => Hash::make('password'),
                'phone'      => '+33 6 77 88 99 00',
                'role'       => 'client',
                'is_student' => false,
                'avatar'     => null,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }

        $this->command->info('✅ Users seeded: ' . count($users) . ' records.');
    }
}
