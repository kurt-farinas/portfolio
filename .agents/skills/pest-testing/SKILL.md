---
name: pest-testing
description: "Idiomatic Pest testing framework patterns for Laravel and PHP applications. Covers Pest syntax, it()/test(), expectation chains, datasets, lifecycle hooks, higher-order tests, architecture testing, AAA pattern, and PHPUnit interoperability."
risk: safe
source: local
date_added: "2026-08-14"
---

# Pest Testing Patterns for Laravel & PHP

## Skill Overview
This skill provides guidance and idioms for writing elegant, maintainable, and expressive test suites in PHP and Laravel using the Pest testing framework (v2/v3).

---

## 1. Core Syntax & Test Anatomy (AAA Pattern)

Every test should follow the **Arrange-Act-Assert (AAA)** pattern:

```php
use App\Models\User;
use App\Models\Invoice;

it('generates an invoice for an active subscription', function () {
    // 1. Arrange
    $user = User::factory()->create();
    $plan = SubscriptionPlan::factory()->create(['price' => 5000]);

    // 2. Act
    $invoice = InvoiceService::createForPlan($user, $plan);

    // 3. Assert
    expect($invoice)
        ->toBeInstanceOf(Invoice::class)
        ->amount->toBe(5000)
        ->status->toBe('pending')
        ->user_id->toBe($user->id);

    $this->assertDatabaseHas('invoices', [
        'id' => $invoice->id,
        'amount' => 5000,
    ]);
});
```

---

## 2. Expectation API & Chaining

Pest provides an expressive, readable expectation API via `expect()`:

```php
// Value assertions
expect($value)->toBe(42)
    ->toBeInt()
    ->toBeGreaterThan(10)
    ->not->toBeNull();

// Array & Collection checks
expect($users)
    ->toBeCollection()
    ->toHaveCount(3)
    ->sequence(
        fn ($user) => $user->role->toBe('admin'),
        fn ($user) => $user->role->toBe('editor'),
        fn ($user) => $user->role->toBe('viewer'),
    );

// Exception assertions
expect(fn () => $account->withdraw(999999))
    ->toThrow(InsufficientFundsException::class, 'Balance is too low');
```

---

## 3. Datasets (Parameterized Testing)

Use `with()` for parameterized testing across multiple scenarios:

```php
// Inline dataset
it('validates email formats correctly', function (string $email, bool $expected) {
    expect(Validator::isValidEmail($email))->toBe($expected);
})->with([
    ['kurt@example.com', true],
    ['invalid-email', false],
    ['user@domain.co.uk', true],
    ['@missing-user.com', false],
]);

// Named / Shared Datasets (tests/Datasets/Emails.php)
dataset('valid_roles', [
    'admin' => ['admin', 1],
    'manager' => ['manager', 2],
    'member' => ['member', 3],
]);

it('assigns correct permission level to role', function (string $role, int $level) {
    expect(Role::permissionLevel($role))->toBe($level);
})->with('valid_roles');
```

---

## 4. Higher-Order Testing

For concise assertions directly on model or state properties:

```php
it('creates a verified user', function () {
    return User::factory()->verified()->create();
})->email_verified_at->not->toBeNull()
  ->is_active->toBeTrue();
```

---

## 5. Lifecycle Hooks

```php
beforeEach(function () {
    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->seed(RolesAndPermissionsSeeder::class);
});

afterEach(function () {
    // Teardown or cleanup if required
});
```

---

## 6. Laravel Application Testing in Pest

### HTTP Feature Tests & Authentication
```php
it('allows approvers to sign off on leave requests', function () {
    $approver = User::factory()->create(['role' => 'approver']);
    $leaveRequest = LeaveRequest::factory()->create(['status' => 'pending']);

    $response = $this->actingAs($approver)
        ->postJson("/api/leave-requests/{$leaveRequest->id}/approve", [
            'remarks' => 'Approved as submitted',
        ]);

    $response->assertOk()
        ->assertJsonPath('data.status', 'approved');

    $this->assertDatabaseHas('leave_requests', [
        'id' => $leaveRequest->id,
        'status' => 'approved',
    ]);
});
```

### Mocking & Fakes
```php
it('dispatches invoice payment event on charge', function () {
    Event::fake();
    Queue::fake();

    PaymentService::charge($order);

    Event::assertDispatched(PaymentProcessed::class);
    Queue::assertPushed(SendReceiptEmailJob::class);
});
```

---

## 7. Architecture Testing (Pest Arch)

Enforce architectural boundaries and clean code rules automatically:

```php
arch('controllers do not access models directly')
    ->expect('App\Http\Controllers')
    ->not->toUse('Illuminate\Database\Eloquent\Model');

arch('models strictly extend BaseModel')
    ->expect('App\Models')
    ->toExtend('App\Models\BaseModel');

arch('strict types are enforced across domain')
    ->expect('App\Domain')
    ->toUseStrictTypes();
```

---

## 8. Pest & PHPUnit Interoperability

- Pest runs on top of PHPUnit — all PHPUnit `assert*()` methods (`$this->assertEquals()`, `$this->assertCount()`) are 100% supported within Pest test closures.
- Traditional `TestCase` classes and Pest test files can coexist in the same `tests/` directory and run simultaneously via `php artisan test` or `./vendor/bin/pest`.
