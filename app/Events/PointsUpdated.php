<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\User;

class PointsUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $user;
    public $pointsChange;
    public $transactionType;
    public $description;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, int $pointsChange, string $transactionType, string $description)
    {
        $this->user = $user;
        $this->pointsChange = $pointsChange;
        $this->transactionType = $transactionType;
        $this->description = $description;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user->id),
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
            'user_id' => $this->user->id,
            'total_points' => $this->user->total_points,
            'points_change' => $this->pointsChange,
            'transaction_type' => $this->transactionType,
            'description' => $this->description,
            'timestamp' => now(),
        ];
    }
}
