<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('car_id')->constrained()->cascadeOnDelete();
            $table->date('pickup_date');
            $table->date('return_date');
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['active', 'completed', 'cancelled'])->default('active');
            $table->boolean('discount_applied')->default(false);
            $table->decimal('discount_amount', 8, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason', 500)->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index(['user_id', 'status']);
            $table->index(['car_id', 'status']);
            $table->index('pickup_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
