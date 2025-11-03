<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_folders', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('parent_id')->nullable()->constrained('media_folders')->onDelete('cascade');
            $table->text('path')->nullable(); // Full path for easier querying
            $table->timestamps();
            
            $table->index('parent_id');
            $table->index('path');
        });
        
        // Add folder_id to media table
        Schema::table('media', function (Blueprint $table) {
            $table->foreignId('folder_id')->nullable()->after('uuid')->constrained('media_folders')->onDelete('set null');
            $table->index('folder_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('media', function (Blueprint $table) {
            $table->dropForeign(['folder_id']);
            $table->dropColumn('folder_id');
        });
        
        Schema::dropIfExists('media_folders');
    }
};
