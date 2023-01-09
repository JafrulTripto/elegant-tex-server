<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use App\Models\Division;
use App\Models\Upazila;
use Illuminate\Http\Request;

class BangladeshGeocodeController extends Controller
{
    public function getDivision(): \Illuminate\Database\Eloquent\Collection
    {
        return Division::all();
    }

    public function getDistrictByDivision(Request $request)
    {
        $divisionId = $request->input("divisionId");
        $division = Division::find($divisionId);
        return $division->districts;
    }
    public function getUpazilasByDistrict (Request $request) {
        $districtId = $request->input("districtId");
        $district = District::find($districtId);
        return $district->upazilas;
    }
    public function getUnionsByUpazila (Request $request) {
        $upazilaId = $request->input("upazilaId");
        $upazila = Upazila::find($upazilaId);
        return $upazila->unions;
    }
}
