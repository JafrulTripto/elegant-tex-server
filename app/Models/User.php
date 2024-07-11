<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     *
     * @return mixed
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    public static function boot()
    {
        parent::boot();

        static::updating(function ($user) {
            $user->last_login = now();
        });
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
    public function marketplace(): BelongsToMany
    {
        return $this->belongsToMany(Marketplace::class);
    }
    public function orderStatusChanges()
    {
        return $this->hasMany(OrderStatusChange::class);
    }
    public function imagePath()
    {
        if ($this->image()->exists()){
            return $this->image()->first()->path;
        }
        return false;
    }
}
