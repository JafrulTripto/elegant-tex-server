<?php

namespace App\Console\Commands;

use App\Models\Release;
use Illuminate\Console\Command;

class PruneReleases extends Command
{
    protected $signature   = 'releases:prune {--months=6 : Delete releases older than this many months}';
    protected $description = 'Delete old release entries to keep the releases table lean';

    public function handle(): int
    {
        $months  = (int) $this->option('months');
        $cutoff  = now()->subMonths($months)->toDateString();
        $deleted = Release::where('released_at', '<', $cutoff)->delete();

        $this->info("Pruned {$deleted} release(s) older than {$months} months.");

        return self::SUCCESS;
    }
}
