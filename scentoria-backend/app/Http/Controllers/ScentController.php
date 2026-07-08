<?php
namespace App\Http\Controllers;
use App\Models\Scent;
use Illuminate\Http\Request;




class ScentController extends Controller
{
            public function index() {
                return response()->json(Scent::all());
            }


            // ScentController.php
            public function show($id) 
                {
                $scent = Scent::with('products')->find($id);

                if (!$scent) {
                    return response()->json(['message' => 'Scent not found'], 404);
                }

                // JSON အဖြစ် ပြောင်းပြီး response မပေးခင် ဒီမှာ array ထဲမှာ products ပါမပါ debug လုပ်ပါ
                $data = $scent->toArray();
                \Log::info('Final Array Check:', $data);
                
                return response()->json($scent);
            }
}
