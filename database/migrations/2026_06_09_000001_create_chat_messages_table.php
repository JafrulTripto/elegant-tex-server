<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role', 20); // 'user' or 'assistant'
            $table->text('content');
            $table->timestamp('created_at')->useCurrent();
        });

        // Fast lookup: all messages for a user in chronological order
        \DB::statement('ALTER TABLE chat_messages ADD INDEX idx_user_created (user_id, created_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
