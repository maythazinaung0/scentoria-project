<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTopup extends Model
{
    use HasFactory;

    
    protected $table = 'wallet_topups';

    
    protected $fillable = [
        'user_id',
        'deposit_amount',
        'topup_channel',
        'status',
        'transaction_image_url', 
    ];

    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}