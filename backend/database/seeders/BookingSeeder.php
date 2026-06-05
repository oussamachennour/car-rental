<?php

namespace Database\Seeders;

use App\Models\Booking;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $bookings = [
            // Active bookings
            [
                'user_id'          => 3,  // Alex Martin (student)
                'car_id'           => 1,  // Renault Clio
                'pickup_date'      => now()->addDays(2)->format('Y-m-d'),
                'return_date'      => now()->addDays(5)->format('Y-m-d'),
                'total_price'      => 58.80,  // 28 * 3 days - 30% student
                'status'           => 'active',
                'discount_applied' => true,
                'discount_amount'  => 25.20,
                'notes'            => 'Retrait à l\'agence centrale.',
            ],
            [
                'user_id'          => 4,  // Jean Dupont
                'car_id'           => 6,  // Toyota RAV4
                'pickup_date'      => now()->addDays(1)->format('Y-m-d'),
                'return_date'      => now()->addDays(6)->format('Y-m-d'),
                'total_price'      => 325.00,  // 65 * 5 days
                'status'           => 'active',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'notes'            => 'Voyage en famille.',
            ],
            [
                'user_id'          => 5,  // Sarah Müller (student)
                'car_id'           => 3,  // Dacia Sandero
                'pickup_date'      => now()->addDays(3)->format('Y-m-d'),
                'return_date'      => now()->addDays(4)->format('Y-m-d'),
                'total_price'      => 15.40,  // 22 * 1 day - 30% student
                'status'           => 'active',
                'discount_applied' => true,
                'discount_amount'  => 6.60,
                'notes'            => null,
            ],
            [
                'user_id'          => 6,  // Carlos Rodríguez
                'car_id'           => 10, // BMW 5 Series
                'pickup_date'      => now()->addDays(5)->format('Y-m-d'),
                'return_date'      => now()->addDays(8)->format('Y-m-d'),
                'total_price'      => 360.00,  // 120 * 3 days
                'status'           => 'active',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'notes'            => 'Voyage d\'affaires.',
            ],

            // Completed bookings
            [
                'user_id'          => 3,  // Alex Martin
                'car_id'           => 4,  // Citroën C3
                'pickup_date'      => now()->subDays(15)->format('Y-m-d'),
                'return_date'      => now()->subDays(12)->format('Y-m-d'),
                'total_price'      => 52.50,  // 25 * 3 - 30%
                'status'           => 'completed',
                'discount_applied' => true,
                'discount_amount'  => 22.50,
                'notes'            => null,
            ],
            [
                'user_id'          => 4,  // Jean Dupont
                'car_id'           => 8,  // Audi Q5
                'pickup_date'      => now()->subDays(30)->format('Y-m-d'),
                'return_date'      => now()->subDays(25)->format('Y-m-d'),
                'total_price'      => 475.00,  // 95 * 5 days
                'status'           => 'completed',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'notes'            => null,
            ],
            [
                'user_id'          => 7,  // Amira Benali (student)
                'car_id'           => 2,  // Peugeot 208
                'pickup_date'      => now()->subDays(20)->format('Y-m-d'),
                'return_date'      => now()->subDays(18)->format('Y-m-d'),
                'total_price'      => 42.00,  // 30 * 2 - 30%
                'status'           => 'completed',
                'discount_applied' => true,
                'discount_amount'  => 18.00,
                'notes'            => 'Week-end à la mer.',
            ],
            [
                'user_id'          => 8,  // Lucas Petit
                'car_id'           => 9,  // Nissan Qashqai
                'pickup_date'      => now()->subDays(10)->format('Y-m-d'),
                'return_date'      => now()->subDays(7)->format('Y-m-d'),
                'total_price'      => 174.00,  // 58 * 3 days
                'status'           => 'completed',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'notes'            => null,
            ],

            // Cancelled bookings
            [
                'user_id'          => 4,  // Jean Dupont
                'car_id'           => 1,  // Renault Clio
                'pickup_date'      => now()->subDays(5)->format('Y-m-d'),
                'return_date'      => now()->subDays(2)->format('Y-m-d'),
                'total_price'      => 84.00,  // 28 * 3 days
                'status'           => 'cancelled',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'cancelled_at'     => now()->subDays(6),
                'cancellation_reason' => 'Changement de plans de voyage.',
            ],
            [
                'user_id'          => 6,  // Carlos
                'car_id'           => 5,  // VW Polo
                'pickup_date'      => now()->subDays(3)->format('Y-m-d'),
                'return_date'      => now()->subDays(1)->format('Y-m-d'),
                'total_price'      => 64.00,  // 32 * 2 days
                'status'           => 'cancelled',
                'discount_applied' => false,
                'discount_amount'  => 0,
                'cancelled_at'     => now()->subDays(4),
                'cancellation_reason' => 'Réunion annulée.',
            ],
        ];

        foreach ($bookings as $bookingData) {
            Booking::create($bookingData);
        }

        $this->command->info('✅ Bookings seeded: ' . count($bookings) . ' records.');
    }
}
