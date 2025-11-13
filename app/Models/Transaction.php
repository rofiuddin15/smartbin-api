<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'smart_bin_id',
        'type',
        'points',
        'bottles_count',
        'ewallet_type',
        'ewallet_account',
        'ewallet_amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'ewallet_amount' => 'decimal:2',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function smartBin()
    {
        return $this->belongsTo(SmartBin::class);
    }

    public function pointTransaction()
    {
        return $this->hasOne(PointTransaction::class);
    }
}
