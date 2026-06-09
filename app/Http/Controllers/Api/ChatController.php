<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChatRequest;
use App\Models\ChatMessage;
use App\Services\ChatService;
use Illuminate\Http\JsonResponse;

class ChatController extends Controller
{
    private ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->middleware("auth:api");
        $this->chatService = $chatService;
    }

    public function send(ChatRequest $request): JsonResponse
    {
        $message = $request->validated("message");
        $history = $request->validated("history", []);

        $result = $this->chatService->handle($message, $history);

        // Only persist when the AI returned a real reply (not an error)
        if (($result["type"] ?? "") !== "error") {
            $userId = auth()->id();
            $now = now();

            ChatMessage::insert([
                [
                    "user_id" => $userId,
                    "role" => "user",
                    "content" => $message,
                    "created_at" => $now,
                ],
                [
                    "user_id" => $userId,
                    "role" => "assistant",
                    "content" => $result["reply"],
                    "created_at" => $now,
                ],
            ]);
        }

        return response()->json($result);
    }

    public function history(): JsonResponse
    {
        // Fetch the most recent 100 messages (DESC), then reverse to
        // display in chronological order in the chat UI.
        $messages = ChatMessage::where("user_id", auth()->id())
            ->orderBy("id", "desc")
            ->limit(100)
            ->get(["role", "content"])
            ->reverse()
            ->values()
            ->toArray();

        return response()->json(["messages" => $messages]);
    }
}
