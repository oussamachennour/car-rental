<?php

namespace Database\Seeders;

use App\Models\Notification;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        // Notifications for managers (user_id 1 and 2)
        $managerNotifications = [
            [
                'user_id' => 1,
                'type'    => 'new_booking',
                'title'   => 'Nouvelle Réservation',
                'message' => 'Alex Martin a réservé une Renault Clio du 10 au 13 mai.',
                'data'    => ['booking_id' => 1, 'car_id' => 1],
                'read_at' => now()->subHours(2),
            ],
            [
                'user_id' => 1,
                'type'    => 'cancellation',
                'title'   => 'Réservation Annulée',
                'message' => 'Jean Dupont a annulé la réservation #9 pour la Renault Clio.',
                'data'    => ['booking_id' => 9],
                'read_at' => null,
            ],
            [
                'user_id' => 1,
                'type'    => 'document',
                'title'   => 'Document Téléchargé',
                'message' => 'Sarah Müller a téléchargé un nouveau passeport — en attente de vérification.',
                'data'    => ['document_id' => 3, 'user_id' => 5],
                'read_at' => null,
            ],
            [
                'user_id' => 1,
                'type'    => 'document',
                'title'   => 'Document Téléchargé',
                'message' => 'Amira Benali a soumis son permis de conduire.',
                'data'    => ['document_id' => 5, 'user_id' => 7],
                'read_at' => null,
            ],
            [
                'user_id' => 1,
                'type'    => 'profile',
                'title'   => 'Profil Mis à Jour',
                'message' => 'Carlos Rodríguez a modifié ses informations de profil.',
                'data'    => ['user_id' => 6],
                'read_at' => now()->subDay(),
            ],
            [
                'user_id' => 1,
                'type'    => 'cancellation',
                'title'   => 'Réservation Annulée',
                'message' => 'Carlos Rodríguez a annulé la réservation #10 pour la VW Polo.',
                'data'    => ['booking_id' => 10],
                'read_at' => now()->subHours(3),
            ],
            [
                'user_id' => 2,
                'type'    => 'new_booking',
                'title'   => 'Nouvelle Réservation',
                'message' => 'Jean Dupont a réservé un Toyota RAV4 pour 5 jours.',
                'data'    => ['booking_id' => 2, 'car_id' => 6],
                'read_at' => null,
            ],
            [
                'user_id' => 2,
                'type'    => 'alert',
                'title'   => 'Maintenance Requise',
                'message' => 'La Porsche Cayenne est en cours de maintenance — mise à jour prévue sous 48h.',
                'data'    => ['car_id' => 12],
                'read_at' => null,
            ],
        ];

        // Notifications for clients
        $clientNotifications = [
            [
                'user_id' => 3,  // Alex Martin
                'type'    => 'system',
                'title'   => 'Réservation Confirmée',
                'message' => 'Votre réservation pour la Renault Clio est confirmée. Bonne route !',
                'data'    => ['booking_id' => 1],
                'read_at' => now()->subHour(),
            ],
            [
                'user_id' => 5,  // Sarah Müller
                'type'    => 'document',
                'title'   => 'Document en Attente',
                'message' => 'Votre passeport est en cours de vérification. Délai : 24h.',
                'data'    => ['document_id' => 3],
                'read_at' => null,
            ],
            [
                'user_id' => 6,  // Carlos
                'type'    => 'document',
                'title'   => 'Document Rejeté',
                'message' => 'Votre permis de conduire a été rejeté : document illisible. Veuillez resoumettre.',
                'data'    => ['document_id' => 4],
                'read_at' => null,
            ],
            [
                'user_id' => 4,  // Jean Dupont
                'type'    => 'system',
                'title'   => 'Rappel de Réservation',
                'message' => 'Votre Toyota RAV4 est disponible pour retrait demain à 09:00.',
                'data'    => ['booking_id' => 2],
                'read_at' => null,
            ],
        ];

        $all = array_merge($managerNotifications, $clientNotifications);

        foreach ($all as $n) {
            Notification::create($n);
        }

        $this->command->info('✅ Notifications seeded: ' . count($all) . ' records.');
    }
}
