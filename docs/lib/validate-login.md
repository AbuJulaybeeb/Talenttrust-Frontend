# Login validation

`validateLogin` is the shared, side-effect-free validator for the login form's
email and password fields. It returns `ValidationError[]` entries in form-field
order so `ErrorSummary` can keep stable links to `#email` and `#password`.

## Rules and precedence

Email validation trims surrounding whitespace, then evaluates one rule at a
time in this order:

1. required;
2. maximum length of 254 characters;
3. format (the value must contain `@`).

Password validation preserves whitespace because it can be part of a password,
then evaluates:

1. required;
2. maximum length of 128 characters;
3. minimum length of 8 characters.

Only the first failing rule for each field is returned. For example, a
255-character email without `@` receives the length error, while a
whitespace-only email receives the required error. When both fields fail, the
email error is returned before the password error.

## Boundary contract

| Input | Expected result |
| --- | --- |
| 253-character valid email | accepted |
| 254-character valid email | accepted |
| 255-character email | maximum-length error |
| 7-character password | minimum-length error |
| 8-character password | accepted |
| 128-character password | accepted |
| 129-character password | maximum-length error |

The constants `MAX_EMAIL_LENGTH` and `MAX_PASSWORD_LENGTH` are exported from
`src/lib/validateLogin.ts` so form controls and tests can use the same ceilings
as the validator.

## Testing

Run the focused suite with:

```bash
npm test -- --runInBand src/lib/validateLogin.test.ts
```

The focused tests cover the exact boundary values, whitespace handling,
required/length/format precedence, and stable cross-field error ordering.
