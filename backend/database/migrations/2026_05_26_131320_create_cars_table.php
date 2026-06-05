<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('make', 100);
            $table->string('model', 100);
            $table->unsignedSmallInteger('year');
            $table->enum('category', ['economy', 'suv', 'luxury', 'van', 'sports']);
            $table->decimal('price_per_day', 8, 2);
            $table->unsignedTinyInteger('seats')->default(5);
            $table->enum('transmission', ['Manual', 'Automatic']);
            $table->enum('fuel_type', ['Petrol', 'Diesel', 'Electric', 'Hybrid']);
            $table->enum('status', ['available', 'rented', 'maintenance', 'unavailable'])->default('available');
            $table->boolean('is_student_friendly')->default(false);
            $table->string('image_url', 500)->nullable();
            $table->text('description')->nullable();
            $table->decimal('rating', 3, 1)->default(4.0);
            $table->unsignedInteger('reviews')->default(0);
            $table->string('color', 50)->nullable();
            $table->string('license_plate', 20)->unique()->nullable();
            $table->unsignedInteger('mileage')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('category');
            $table->index('is_student_friendly');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
