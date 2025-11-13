<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SmartBin extends Model
{
    use HasFactory;

    protected $fillable = [
        'bin_code',
        'name',
        'location',
        'latitude',
        'longitude',
        'status',
        'capacity_percentage',
        'total_bottles_collected',
        'last_online_at',
    ];

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'last_online_at' => 'datetime',
    ];

    // Relationships
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
