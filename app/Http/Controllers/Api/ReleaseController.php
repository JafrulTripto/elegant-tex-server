<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Release;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReleaseController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api')->only('acknowledge');
    }

    /**
     * Called by the GitHub Action after a deploy.
     * Protected by a static token, not a user JWT.
     */
    public function store(Request $request): JsonResponse
    {
        $token = config('services.release.token');

        if (!$token || $request->header('X-Release-Token') !== $token) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'title'            => ['required', 'string', 'max:255'],
            'features'         => ['required', 'array', 'min:1'],
            'features.*.icon'  => ['required', 'string'],
            'features.*.title' => ['required', 'string'],
            'features.*.description' => ['required', 'string'],
        ]);

        $version = now()->toDateString(); // YYYY-MM-DD

        $release = Release::updateOrCreate(
            ['version' => $version],
            [
                'title'       => $request->title,
                'features'    => $request->features,
                'released_at' => $version,
            ]
        );

        return response()->json(['version' => $release->version], 201);
    }

    /**
     * Mark the current user as having seen all releases up to now.
     */
    public function acknowledge(): JsonResponse
    {
        $latest = Release::orderByDesc('released_at')->value('version');

        if ($latest) {
            auth()->user()->update(['last_seen_release' => $latest]);
        }

        return response()->json(['ok' => true]);
    }
}
