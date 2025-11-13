<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\SmartBin;

class SmartBinStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $smartBin;

    /**
     * Create a new event instance.
     */
    public function __construct(SmartBin $smartBin)
    {
        $this->smartBin = $smartBin;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('smart-bins'),
            new Channel('smart-bin.' . $this->smartBin->id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'bin_id' => $this->smartBin->id,
            'bin_code' => $this->smartBin->bin_code,
            'name' => $this->smartBin->name,
            'status' => $this->smartBin->status,
            'capacity_percentage' => $this->smartBin->capacity_percentage,
            'total_bottles_collected' => $this->smartBin->total_bottles_collected,
            'last_online_at' => $this->smartBin->last_online_at,
            'timestamp' => now(),
        ];
    }
}
