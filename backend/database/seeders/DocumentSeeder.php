<?php

namespace Database\Seeders;

use App\Models\Document;
use Illuminate\Database\Seeder;

class DocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'user_id'   => 3,   // Alex Martin
                'type'      => 'drivers_license',
                'file_name' => 'permis_de_conduire_alex.pdf',
                'file_path' => 'documents/3/permis_de_conduire_alex.pdf',
                'file_size' => 1258291,   // ~1.2 MB
                'mime_type' => 'application/pdf',
                'status'    => 'verified',
                'verified_at'  => now()->subDays(10),
                'verified_by'  => 1,  // Manager Marie
            ],
            [
                'user_id'   => 4,  // Jean Dupont
                'type'      => 'drivers_license',
                'file_name' => 'license_jean_dupont.jpg',
                'file_path' => 'documents/4/license_jean_dupont.jpg',
                'file_size' => 874320,
                'mime_type' => 'image/jpeg',
                'status'    => 'verified',
                'verified_at' => now()->subDays(20),
                'verified_by' => 1,
            ],
            [
                'user_id'   => 5,  // Sarah Müller
                'type'      => 'passport',
                'file_name' => 'passport_sarah.png',
                'file_path' => 'documents/5/passport_sarah.png',
                'file_size' => 2097152,  // 2 MB
                'mime_type' => 'image/png',
                'status'    => 'pending',
                'verified_at' => null,
                'verified_by' => null,
            ],
            [
                'user_id'   => 6,  // Carlos
                'type'      => 'drivers_license',
                'file_name' => 'carnet_carlos.pdf',
                'file_path' => 'documents/6/carnet_carlos.pdf',
                'file_size' => 1572864,
                'mime_type' => 'application/pdf',
                'status'    => 'rejected',
                'verified_at'        => null,
                'verified_by'        => null,
                'rejection_reason'   => 'Document illisible, veuillez soumettre une copie plus claire.',
            ],
            [
                'user_id'   => 7,  // Amira Benali
                'type'      => 'drivers_license',
                'file_name' => 'permis_amira.jpg',
                'file_path' => 'documents/7/permis_amira.jpg',
                'file_size' => 943718,
                'mime_type' => 'image/jpeg',
                'status'    => 'pending',
                'verified_at' => null,
                'verified_by' => null,
            ],
            [
                'user_id'   => 8,  // Lucas Petit
                'type'      => 'id_card',
                'file_name' => 'carte_identite_lucas.pdf',
                'file_path' => 'documents/8/carte_identite_lucas.pdf',
                'file_size' => 786432,
                'mime_type' => 'application/pdf',
                'status'    => 'verified',
                'verified_at' => now()->subDays(5),
                'verified_by' => 2,  // Manager Thomas
            ],
        ];

        foreach ($documents as $doc) {
            Document::create($doc);
        }

        $this->command->info('✅ Documents seeded: ' . count($documents) . ' records.');
    }
}
