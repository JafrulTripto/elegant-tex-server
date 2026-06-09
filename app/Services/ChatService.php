<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatService
{
    private Client $httpClient;
    private array $userCtx = [];

    public function __construct()
    {
        $this->httpClient = new Client([
            "base_uri" => config("services.deepseek.base_url"),
            "timeout" => 20,
            "connect_timeout" => 10,
            "curl" => [
                CURLOPT_TIMEOUT => 20,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_FRESH_CONNECT => true,
                CURLOPT_FORBID_REUSE => true,
            ],
        ]);
    }

    /**
     * Main entry point. Sends the message to DeepSeek with tool definitions.
     * The AI writes SQL queries; we execute them safely and return the results
     * for the AI to format into a human-readable answer.
     */
    public function handle(string $message, array $history = []): array
    {
        $this->userCtx = $this->resolveUserContext();

        try {
            $toolResults = [];
            $maxIterations = 3;
            $iterations = 0;

            $result = $this->callDeepSeek(
                $message,
                $this->toolDefinitions(),
                [],
                $history,
            );

            while (!empty($result["tool_calls"]) && $iterations < $maxIterations) {
                $newResults = $this->executeTools($result);
                $toolResults = array_merge($toolResults, $newResults);
                $iterations++;

                $isLastIteration = $iterations >= $maxIterations;
                $result = $this->callDeepSeek(
                    $message,
                    $this->toolDefinitions(),
                    $toolResults,
                    $history,
                    $isLastIteration ? "none" : "auto",
                );
            }

            Log::info("Chat query", [
                "user_id" => $this->userCtx["id"],
                "user_name" => $this->userCtx["name"],
                "can_view_all" => $this->userCtx["canViewAll"],
                "message" => $message,
                "tool_iterations" => $iterations,
            ]);

            return $this->reply($result["content"] ?? "Done.", "general");
        } catch (\Throwable $e) {
            Log::error("ChatService error: " . $e->getMessage());
            if (str_contains($e->getMessage(), "401")) {
                return $this->reply(
                    "DeepSeek rejected the API key. Check DEEPSEEK_API_KEY in .env.",
                    "error",
                );
            }
            return $this->reply("Chat error: " . $e->getMessage(), "error");
        }
    }

    // ─── DeepSeek API ───────────────────────────────────────────────

    private function callDeepSeek(
        string $userMessage,
        array $tools,
        array $toolResults = [],
        array $history = [],
        string $toolChoice = "auto",
    ): array {
        $messages = [["role" => "system", "content" => $this->systemPrompt()]];

        // Cap context sent to DeepSeek — older messages add tokens but little value
        foreach (array_slice($history, -20) as $h) {
            $messages[] = ["role" => $h["role"], "content" => $h["content"]];
        }

        $messages[] = ["role" => "user", "content" => $userMessage];

        foreach ($toolResults as $tr) {
            $messages[] = $tr["call"];
            $messages[] = $tr["result"];
        }

        $body = [
            "model" => config("services.deepseek.model", "deepseek-chat"),
            "messages" => $messages,
            "tools" => $tools,
            "tool_choice" => $toolChoice,
            "max_tokens" => 1024,
            "temperature" => 0.1,
        ];

        try {
            $response = $this->httpClient->post("/v1/chat/completions", [
                "headers" => [
                    "Authorization" => "Bearer " . config("services.deepseek.api_key"),
                    "Content-Type" => "application/json",
                ],
                "json" => $body,
            ]);

            $data = json_decode($response->getBody(), true);
            $choice = $data["choices"][0] ?? [];
            $msg = $choice["message"] ?? [];

            return [
                "content" => $msg["content"] ?? null,
                "tool_calls" => $msg["tool_calls"] ?? [],
                "raw_message" => $msg,
            ];
        } catch (GuzzleException $e) {
            Log::error("DeepSeek API error: " . $e->getMessage());
            throw $e;
        }
    }

    // ─── System Prompt ──────────────────────────────────────────────

    private function systemPrompt(): string
    {
        $user = $this->userCtx;
        $scope = $user["canViewAll"]
            ? "You can see ALL orders and data in the system."
            : "You can ONLY see orders submitted by {$user["name"]} (created_by = {$user["id"]}). Never show data from other staff members. This is enforced at the database level — do not add extra WHERE clauses for it yourself.";

        return <<<PROMPT
You are Jarvis, a helpful assistant for Elegant Tex, a textile order management system in Bangladesh.
You answer questions by writing SQL queries against the database and presenting the results clearly.

Logged-in user: {$user["name"]} (ID: {$user["id"]})
Data scope: {$scope}

RULES:
- Always use run_query to answer data questions — never guess or make up numbers.
- Write clean MySQL 8 SELECT queries using the schema below.
- Format currency as ৳ (BDT). Keep answers brief — staff are on mobile.
- If a query returns 0 rows, say so honestly.
- You may call run_query multiple times if needed to answer fully.

DATABASE SCHEMA:

orders
  id            BIGINT PK
  order_id      VARCHAR    -- human-readable reference (nullable)
  status        INT        -- 1=DRAFT 2=APPROVED 3=PRODUCTION 4=QA 5=READY 6=DELIVERED 7=RETURNED 8=CANCELLED 9=BOOKING
  orderable_type VARCHAR   -- 'App\Models\Marketplace' or 'App\Models\Merchant'
  orderable_id  BIGINT     -- FK to marketplaces.id or merchants.id
  customer_id   BIGINT     -- FK to customers.id (nullable)
  created_by    BIGINT     -- FK to users.id (the staff member who submitted the order)
  delivery_date DATE
  amount        INT        -- BDT
  delivery_charge INT      -- BDT
  total_amount  INT        -- BDT (amount + delivery_charge)
  created_at    DATETIME
  updated_at    DATETIME

customers
  id          BIGINT PK
  name        VARCHAR
  alt_phone   VARCHAR
  facebook_id VARCHAR

address
  id               BIGINT PK
  addressable_id   BIGINT
  addressable_type VARCHAR   -- 'App\Models\Customer' for customer addresses
  address          VARCHAR
  phone            VARCHAR
  district         VARCHAR
  division         VARCHAR

users                         -- staff members who create orders
  id        BIGINT PK
  firstname VARCHAR
  lastname  VARCHAR
  email     VARCHAR

products                      -- line items within an order
  id          BIGINT PK
  order_id    BIGINT FK → orders.id
  description TEXT
  count       INT             -- quantity
  price       DECIMAL(10,2)

marketplaces
  id   BIGINT PK
  name VARCHAR

merchants
  id   BIGINT PK
  name VARCHAR

order_status_changes           -- audit log of status history
  id        BIGINT PK
  order_id  BIGINT FK → orders.id
  user_id   BIGINT FK → users.id
  status    BIGINT
  comment   VARCHAR
  created_at DATETIME

JOIN PATTERNS:
-- Source name (marketplace or merchant):
  LEFT JOIN marketplaces mp ON o.orderable_type = 'App\\\\Models\\\\Marketplace' AND o.orderable_id = mp.id
  LEFT JOIN merchants me ON o.orderable_type = 'App\\\\Models\\\\Merchant' AND o.orderable_id = me.id
  -- then use: COALESCE(mp.name, me.name) AS source

-- Customer phone:
  LEFT JOIN address a ON a.addressable_type = 'App\\\\Models\\\\Customer' AND a.addressable_id = o.customer_id

-- Staff who submitted the order:
  JOIN users u ON o.created_by = u.id
  -- user full name: CONCAT(u.firstname, ' ', u.lastname)

COMMON PATTERNS:
- Pending orders:  WHERE o.status IN (1, 9)
- Active/in-progress: WHERE o.status IN (2, 3, 4, 5)
- Overdue: WHERE o.delivery_date < CURDATE() AND o.status NOT IN (6, 7, 8)
- This month: WHERE YEAR(o.created_at) = YEAR(CURDATE()) AND MONTH(o.created_at) = MONTH(CURDATE())
- March 2026: WHERE o.created_at BETWEEN '2026-03-01' AND '2026-03-31 23:59:59'
- Today's orders: WHERE DATE(o.created_at) = CURDATE()
- Always alias orders table as 'o': FROM orders o
- CONCAT(u.firstname, ' ', u.lastname) for staff member full name
PROMPT;
    }

    // ─── Tool Definitions ───────────────────────────────────────────

    private function toolDefinitions(): array
    {
        return [
            [
                "type" => "function",
                "function" => [
                    "name" => "run_query",
                    "description" => "Execute a read-only MySQL SELECT query against the Elegant Tex database and return the results. Write queries based on the schema in the system prompt.",
                    "parameters" => [
                        "type" => "object",
                        "properties" => [
                            "sql" => [
                                "type" => "string",
                                "description" => "A MySQL SELECT query. No semicolons. LIMIT will be enforced automatically.",
                            ],
                        ],
                        "required" => ["sql"],
                    ],
                ],
            ],
        ];
    }

    // ─── Tool Executor ──────────────────────────────────────────────

    private function executeTools(array $result): array
    {
        $results = [];
        $rawMessage = $result["raw_message"] ?? [];

        foreach ($result["tool_calls"] as $call) {
            $fn = $call["function"] ?? [];
            $name = $fn["name"] ?? "";
            $args = json_decode($fn["arguments"] ?? "{}", true) ?? [];

            $output = match ($name) {
                "run_query" => $this->toolRunQuery($args["sql"] ?? ""),
                default => ["error" => "Unknown tool: {$name}"],
            };

            $assistantMsg = [
                "role" => "assistant",
                "tool_calls" => [$call],
            ];
            if (!empty($rawMessage["reasoning_content"])) {
                $assistantMsg["reasoning_content"] = $rawMessage["reasoning_content"];
            }

            $results[] = [
                "call" => $assistantMsg,
                "result" => [
                    "role" => "tool",
                    "tool_call_id" => $call["id"],
                    "content" => json_encode($output),
                ],
            ];
        }

        return $results;
    }

    // ─── Query Executor ─────────────────────────────────────────────

    private function toolRunQuery(string $sql): array
    {
        $sql = trim($sql);

        if (empty($sql)) {
            return ["error" => "Empty query."];
        }

        // Only SELECT statements are allowed
        if (!preg_match('/^SELECT\s/i', $sql)) {
            return ["error" => "Only SELECT queries are permitted."];
        }

        // Strip trailing semicolon; block multiple statements
        $sql = rtrim($sql, ';');
        if (str_contains($sql, ';')) {
            return ["error" => "Multiple statements are not allowed."];
        }

        // Block DDL/DML as a second layer of defence
        if (preg_match('/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|EXECUTE|GRANT|REVOKE|LOAD|INTO)\b/i', $sql)) {
            return ["error" => "Only SELECT queries are permitted."];
        }

        // Enforce LIMIT to prevent runaway result sets
        if (!preg_match('/\bLIMIT\b/i', $sql)) {
            $sql .= ' LIMIT 100';
        }

        // For non-admin users, shadow the `orders` table with a user-scoped CTE
        // so the AI-generated query only ever sees orders belonging to this user.
        if (!$this->userCtx["canViewAll"] && preg_match('/\borders\b/i', $sql)) {
            $userId = (int) $this->userCtx["id"];
            $sql = "WITH orders AS (SELECT * FROM orders WHERE created_by = {$userId}) " . $sql;
        }

        Log::debug("Chat SQL", ["sql" => $sql, "user_id" => $this->userCtx["id"]]);

        try {
            $rows = DB::select($sql);
            $rows = array_map(fn($r) => (array) $r, array_slice($rows, 0, 100));

            return [
                "row_count" => count($rows),
                "rows" => $rows,
            ];
        } catch (\Exception $e) {
            Log::error("Chat SQL error: " . $e->getMessage(), ["sql" => $sql]);
            return ["error" => "Query failed: " . $e->getMessage()];
        }
    }

    // ─── User Context ───────────────────────────────────────────────

    private function resolveUserContext(): array
    {
        $user = auth()->user();

        return [
            "id" => $user?->id,
            "name" => $user?->name ?? $user?->email ?? "Unknown",
            "canViewAll" => $user?->can("VIEW_ALL_ORDERS") ?? false,
        ];
    }

    // ─── Response Builder ───────────────────────────────────────────

    private function reply(string $text, string $type = "general", array $data = []): array
    {
        return [
            "reply" => $text,
            "type" => $type,
            "data" => $data,
        ];
    }
}
