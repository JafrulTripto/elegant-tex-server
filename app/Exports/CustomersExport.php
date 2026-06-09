<?php

namespace App\Exports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class CustomersExport implements WithMultipleSheets
{
    private $search;

    public function __construct(?string $search = null)
    {
        $this->search = $search;
    }

    /**
     * @return array
     */
    public function sheets(): array
    {
        $years = Customer::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->get()
            ->pluck('year');

        $sheets = [];

        foreach ($years as $year) {
            $sheets[] = new CustomersYearSheet((int)$year, $this->search);
        }

        return $sheets;
    }
}
