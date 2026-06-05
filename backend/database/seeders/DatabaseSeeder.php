<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\UserSeeder;
use Database\Seeders\CarSeeder;
use Database\Seeders\BookingSeeder;
use Database\Seeders\DocumentSeeder;
use Database\Seeders\NotificationSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
        UserSeeder::class,
        CarSeeder::class,
        BookingSeeder::class,
        DocumentSeeder::class,
        NotificationSeeder::class,
    ]);
    }
}
