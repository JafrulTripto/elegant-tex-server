<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamResource;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index(): JsonResponse
    {
        $teams = Team::withCount('users')->orderBy('name')->get();
        return response()->json(['data' => TeamResource::collection($teams)]);
    }

    public function options(): JsonResponse
    {
        return response()->json(['data' => Team::orderBy('name')->get(['id', 'name'])]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['name' => ['required', 'string', 'max:255', 'unique:teams,name']]);

        $team = new Team();
        $team->name = $request->input('name');
        $team->save();

        return response()->json(['message' => 'Team created successfully.']);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json(['message' => 'Team not found.'], 404);
        }

        $request->validate(['name' => ['required', 'string', 'max:255', "unique:teams,name,{$id}"]]);
        $team->name = $request->input('name');
        $team->save();

        return response()->json(['message' => 'Team updated successfully.', 'data' => new TeamResource($team)]);
    }

    public function destroy($id): JsonResponse
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json(['message' => 'Team not found.'], 404);
        }
        if (strcasecmp($team->name, 'Unassigned') === 0) {
            return response()->json(['message' => 'The Unassigned team cannot be deleted.'], 400);
        }
        if ($team->users()->exists()) {
            return response()->json(['message' => 'Reassign this team\'s members before deleting it.'], 400);
        }

        $team->delete();
        return response()->json(['message' => 'Team deleted successfully.']);
    }

    /** Members of a team. */
    public function members($id): JsonResponse
    {
        $users = User::where('team_id', $id)->get(['id', 'firstname', 'lastname', 'team_id']);
        return response()->json(['data' => $users]);
    }

    /** All users with their current team, for the assignment UI. */
    public function assignableUsers(): JsonResponse
    {
        $users = User::get(['id', 'firstname', 'lastname', 'team_id']);
        return response()->json(['data' => $users]);
    }

    /** Move the given users into this team. */
    public function assignUsers(Request $request, $id): JsonResponse
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json(['message' => 'Team not found.'], 404);
        }
        $request->validate([
            'user_ids' => ['required', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        User::whereIn('id', $request->input('user_ids'))->update(['team_id' => $team->id]);

        return response()->json(['message' => 'Members updated successfully.']);
    }
}
