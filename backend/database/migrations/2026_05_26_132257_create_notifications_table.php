<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['cancellation', 'document', 'profile', 'new_booking', 'system', 'alert']);
            $table->string('title', 255);
            $table->string('message', 1000);
            $table->json('data')->nullable();           // Extra context payload
            $table->timestamp('read_at')->nullable();
            $table->string('action_url', 500)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index('type');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
