---
name: caching-patterns
description: "Application-level caching architecture and strategies covering Cache-Aside, Write-Through/Behind, TTL design, stampede prevention (mutex locks, SWR), cache key naming, Redis data structures, and Laravel Cache integration with tags and flexible caching."
risk: safe
source: local
date_added: "2026-08-14"
---

# Application Caching Patterns & Strategy

## Skill Overview
This skill provides comprehensive architectural patterns and production guidelines for application-level caching, high-concurrency read optimization, distributed cache invalidation, and Redis/Laravel integration.

---

## 1. Core Architectural Patterns

### A. Cache-Aside (Lazy Loading)
- **Workflow**: Application queries cache first. On miss, queries primary database, writes result to cache with a TTL, and returns data.
- **Best For**: Read-heavy workloads with unpredictable access patterns.
- **Trade-off**: Cache misses incur round-trip penalty; risk of stale data if mutations bypass cache.

```php
// Idiomatic Laravel Cache-Aside
$userProfile = Cache::remember("users:profile:{$userId}", now()->addHours(2), function () use ($userId) {
    return User::with(['roles', 'preferences'])->findOrFail($userId);
});
```

### B. Write-Through & Write-Behind (Write-Back)
- **Write-Through**: Application writes data to the cache and the primary store simultaneously before confirming success.
- **Write-Behind (Asynchronous)**: Writes immediately to cache; asynchronous background jobs or message queues flush updates to the permanent datastore in batches.
- **Best For**: High write-throughput systems (analytics ingestion, counters, chat sessions).

### C. Stale-While-Revalidate (SWR) / Flexible Caching
- Returns stale cached data immediately to the client while dispatching a background refresh if within the grace window.
- **Laravel 11+ Native Support**:
```php
// Serves instantly for 5 seconds; refreshes in background if requested between 5s and 30s
$metrics = Cache::flexible('analytics:dashboard:summary', [5, 30], function () {
    return AnalyticsService::computeHeavySummary();
});
```

---

## 2. Cache Invalidation & Key Design

### Key Naming Conventions
Always use structured, hierarchical, versioned colon-separated keys:
`[env]:[domain]:[resource]:[id]:[representation]:[version]`

- **Good**: `prod:users:482:profile:v2`
- **Good**: `prod:tenants:14:billing:summary`
- **Bad**: `user_data_482` (unscoped, no versioning, collisions risk)

### Invalidation Strategies
1. **Direct Invalidation on Mutation**: Purge or update keys explicitly inside Model Observers, Events, or Command Handlers.
```php
public function updated(User $user): void
{
    Cache::forget("users:profile:{$user->id}");
}
```
2. **Cache Tagging (Redis / Memcached)**: Group related cached items across multiple dimensions for bulk eviction.
```php
// Tagged write
Cache::tags(['tenant:12', 'invoices'])->put("tenant:12:invoice:901", $invoice, now()->addDay());

// Bulk eviction when tenant updates billing settings
Cache::tags(['tenant:12'])->flush();
```
3. **Key Versioning / Prefix Bumping**: Increment a namespace version counter instead of executing costly wildcard `KEYS *` commands on Redis.

---

## 3. Stampede (Thundering Herd) Prevention

When high-traffic cached items expire, thousands of concurrent requests can hammer the database simultaneously.

### Prevention Techniques
1. **Atomic Locks (Mutex Locking)**:
```php
$data = Cache::get($key);

if ($data === null) {
    $lock = Cache::lock("lock:{$key}", 10); // 10-second lock
    
    if ($lock->get()) {
        try {
            $data = DatabaseQuery::run();
            Cache::put($key, $data, $ttl);
        } finally {
            $lock->release();
        }
    } else {
        // Wait or return fallback/stale value
        sleep(1);
        $data = Cache::get($key) ?? FallbackService::get();
    }
}
```
2. **TTL Jitter**: Add random variance (e.g. `now()->addMinutes(60 + rand(1, 10))`) to prevent simultaneous expiration of bulk-cached records.
3. **Probabilistic Early Recomputation (XFetch)**.

---

## 4. Redis Application-Level Data Structures

Choose the right Redis primitive for optimal memory and time complexity:
- **Strings**: JSON blobs, serialized objects, session state.
- **Hashes**: Object attributes where individual fields need atomic updates without deserializing the whole payload.
- **Sorted Sets (ZSET)**: Real-time leaderboards, rate limiting windows, scheduled priority queues.
- **Sets**: Unique visitor tracking, tag relationships, active socket connections.
- **Bitmaps / HyperLogLog**: Massive scale unique counting (DAU/MAU) with negligible memory.

---

## 5. Caching Checklist for Full-Stack Developers

1. **Deterministic Serialization**: Never cache live un-hydrated PDO resources or circular object trees.
2. **Cache Eviction Policy**: Verify Redis memory policies (`maxmemory-policy: volatile-lru` or `allkeys-lru`).
3. **Graceful Fallbacks**: Wrap cache calls with try-catch or graceful fallbacks so cache server downtime does not take down the web application.
4. **No Sensitive Data in Plaintext**: Never cache plaintext credentials, unhashed tokens, or raw PII in shared cache clusters.
