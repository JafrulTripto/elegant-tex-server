<?php

namespace App\Exports;

use App\Models\Customer;
use App\Models\Division;
use App\Models\District;
use App\Models\Upazila;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersYearSheet implements FromQuery, WithTitle, WithHeadings, WithMapping
{
    private $year;
    private $search;

    private static $divisions = null;
    private static $districts = null;
    private static $upazilas = null;

    public function __construct(int $year, ?string $search = null)
    {
        $this->year = $year;
        $this->search = $search;

        if (self::$divisions === null) {
            self::$divisions = Division::all()->pluck('name', 'id')->toArray();
            self::$districts = District::all()->pluck('name', 'id')->toArray();
            self::$upazilas = Upazila::all()->pluck('name', 'id')->toArray();
        }
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query()
    {
        $query = Customer::query()->with('address')
            ->whereYear('created_at', $this->year);

        if (!empty($this->search)) {
            $query->where(function($q) {
                $q->where('name', 'like', "%{$this->search}%")
                  ->orWhere('alt_phone', 'like', "%{$this->search}%")
                  ->orWhereHas('address', function($addrQ) {
                      $addrQ->where('phone', 'like', "%{$this->search}%");
                  });
            });
        }

        return $query;
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return (string) $this->year;
    }

    public function headings(): array
    {
        return [
            'Name',
            'Phone',
            'Address',
            'Facebook ID',
            'Created At'
        ];
    }

    /**
     * @param mixed $customer
     * @return array
     */
    public function map($customer): array
    {
        $addressParts = [];
        $phone = $customer->alt_phone ?? 'N/A';
        
        if ($customer->address) {
            $phone = $customer->address->phone ?? $phone;
            if (!empty($customer->address->address)) {
                $addressParts[] = $customer->address->address;
            }

            // Use raw attributes to avoid triggered N+1 queries in the Address model
            $upazilaId = $customer->address->getRawOriginal('upazila');
            $districtId = $customer->address->getRawOriginal('district');
            $divisionId = $customer->address->getRawOriginal('division');

            if ($upazilaId && isset(self::$upazilas[$upazilaId])) {
                $addressParts[] = self::$upazilas[$upazilaId];
            }
            if ($districtId && isset(self::$districts[$districtId])) {
                $addressParts[] = self::$districts[$districtId];
            }
            if ($divisionId && isset(self::$divisions[$divisionId])) {
                $addressParts[] = self::$divisions[$divisionId];
            }
        }

        $addressStr = !empty($addressParts) ? implode(', ', $addressParts) : 'N/A';

        return [
            $customer->name,
            $phone,
            $addressStr,
            $customer->facebook_id ?? 'N/A',
            $customer->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
