<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Exports\CustomersExport;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerController extends Controller
{
  private const PAGESIZE = 10;

  public function index(Request $request)
  {
    $pageSize = self::PAGESIZE;
    $paginate = $request->get("paginate", true);
    $paginateBoolean = filter_var(
      $paginate,
      FILTER_VALIDATE_BOOLEAN,
      FILTER_NULL_ON_FAILURE,
    );

    $query = Customer::with(["address"]);

    // Search functionality
    $search = $request->input("search", "");
    if (!empty($search)) {
      $query
        ->where("name", "like", "%{$search}%")
        ->orWhere("alt_phone", "like", "%{$search}%")
        ->orWhereHas("address", function ($q) use ($search) {
          $q->where("phone", "like", "%{$search}%");
        });
    }

    if ($paginateBoolean) {
      $customers = $query->paginate($pageSize);
      return response()->json($customers);
    } else {
      ini_set("memory_limit", "-1");
      set_time_limit(0);

      $customers = $query->get();
      return response()->json($customers);
    }
  }

  public function export(Request $request)
  {
    ini_set("memory_limit", "1024M");
    set_time_limit(0);

    $search = $request->input("search", "");
    return Excel::download(new CustomersExport($search), "customers.xlsx");
  }

  public function searchByPhone(Request $request)
  {
    $phone = $request->input("phone", "");
    $digits = preg_replace("/\D/", "", $phone);

    if (empty($digits) || strlen($digits) < 3) {
      return response()->json([]);
    }

    // Cache geolocation lookups to avoid N+1 queries from Address accessors
    $divisions = \App\Models\Division::pluck("name", "id");
    $districts = \App\Models\District::pluck("name", "id");
    $upazilas = \App\Models\Upazila::pluck("name", "id");

    // Fetch a broader set then filter in PHP to support inconsistent phone formats
    $customers = Customer::whereHas("address")
      ->with("address")
      ->limit(50)
      ->get()
      ->filter(function ($c) use ($digits) {
        $phoneDigits = preg_replace("/\D/", "", $c->address->phone);
        return str_contains($phoneDigits, $digits);
      })
      ->take(10)
      ->values();

    return response()->json(
      $customers->map(function ($customer) use ($divisions, $districts, $upazilas) {
        $addr = $customer->address;
        $divId = (int) $addr->getRawOriginal("division");
        $distId = (int) $addr->getRawOriginal("district");
        $upaId = $addr->getRawOriginal("upazila")
          ? (int) $addr->getRawOriginal("upazila")
          : null;

        return [
          "id" => $customer->id,
          "name" => $customer->name,
          "phone" => $addr->phone,
          "altPhone" => $customer->alt_phone,
          "facebook" => $customer->facebook_id,
          "address" => $addr->address,
          "division" => [
            "value" => $divId,
            "name" => $divisions[$divId] ?? "",
          ],
          "district" => [
            "value" => $distId,
            "name" => $districts[$distId] ?? "",
          ],
          "upazila" => [
            "value" => $upaId,
            "name" => $upaId ? ($upazilas[$upaId] ?? "") : "",
          ],
        ];
      }),
    );
  }
}
