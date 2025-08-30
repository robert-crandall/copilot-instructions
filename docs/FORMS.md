# Form Components System

This document describes the standardized form system for the Copilot Instructions project, built with DaisyUI 5 and TailwindCSS 4.

## Overview

The form system provides a consistent, accessible, and mobile-responsive approach to building forms across the application. It follows the Material Design 3 principles with DaisyUI component styling.

## Components

### FormField.svelte

The primary form input component that wraps DaisyUI's `form-control` pattern.

**Props:**

- `label: string` - The label text for the field
- `name: string` - The input name and ID
- `type: string` - Input type (default: "text")
- `value: string` - Bound value
- `description: string` - Help text displayed below the input
- `error: string` - Error message (if any)
- `placeholder: string` - Placeholder text
- `disabled: boolean` - Whether the input is disabled
- `autocomplete: string` - Autocomplete attribute
- `min: number` - Minimum value/length
- `max: number` - Maximum value/length
- `required: boolean` - Whether the field is required
- `rows: number` - Number of rows for textarea (when provided, renders textarea instead of input)
- `class: string` - Additional CSS classes

**Events:**

- `on:blur` - Input blur event
- `on:input` - Input change event
- `on:focus` - Input focus event
- `on:change` - Input change event

**Example:**

```svelte
<FormField
  label="Email Address"
  name="email"
  type="email"
  bind:value={email}
  error={emailError}
  description="We'll never share your email"
  placeholder="you@example.com"
  autocomplete="email"
  required
  class="md:col-span-2"
  on:blur={validateEmail}
/>

<!-- Textarea example -->
<FormField
  label="Message"
  name="message"
  bind:value={message}
  description="Optional longer description"
  error={messageError}
  placeholder="Enter your message here..."
  rows={4}
  class="md:col-span-2"
  on:blur={validateMessage}
/>
```

### FormDemo.svelte

A comprehensive demonstration of the form system showing:

- Grid layout patterns
- Validation handling
- Mobile responsiveness
- Real-time form state updates
- Accessibility features

Access the demo at `/demo` when logged in or out.

## Layout Patterns

### Grid Layout

Use CSS Grid for consistent form layouts:

```svelte
<form class="grid grid-cols-1 gap-6 md:grid-cols-2">
  <!-- Full-width fields -->
  <FormField ... class="md:col-span-2" />

  <!-- Half-width fields on desktop -->
  <FormField ... />
  <FormField ... />

  <!-- Submit button -->
  <div class="md:col-span-2">
    <button class="btn btn-primary h-10 w-full">Submit</button>
  </div>
</form>
```

### Spacing

- Use `gap-6` for consistent field spacing
- Use `h-10` for input heights (44px minimum touch target)
- Use `w-full` for full-width inputs

## Validation Patterns

### Real-time Validation

```svelte
<script>
  let email = '';
  let emailError = '';

  function validateEmail() {
    emailError = email.includes('@') ? '' : 'Invalid email';
  }

  // Real-time validation
  $: emailError = email ? validateEmail(email) : '';
</script>

<FormField bind:value={email} error={emailError} on:blur={validateEmail} />
```

### Form Submission

```svelte
function handleSubmit() {
  // Validate all fields
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password)
  };

  // Check if valid
  const isValid = Object.values(errors).every(error => error === "");

  if (isValid) {
    // Submit form
  }
}
```

## Accessibility Features

- **Proper labeling**: Every input has an associated label
- **ARIA attributes**: `aria-invalid`, `aria-describedby` for screen readers
- **Touch targets**: Minimum 44px height for mobile usability
- **Focus management**: Proper tab order and focus indicators
- **Error association**: Errors are properly linked to inputs

## Mobile Considerations

- **Responsive breakpoints**: Uses `md:` prefix for desktop layouts
- **Touch-friendly sizing**: All interactive elements meet 44px minimum
- **Viewport optimization**: Forms scale properly on all screen sizes
- **Keyboard support**: Works with mobile virtual keyboards

## DaisyUI Classes Used

- `form-control` - Container for each field
- `label` - Label styling
- `label-text` - Label text styling
- `label-text-alt` - Help and error text styling
- `input` - Input field styling
- `input-bordered` - Input border styling
- `input-error` - Error state styling

## Migration from Old Forms

To migrate existing forms:

1. Replace custom form markup with `FormField` components
2. Update form container to use grid layout
3. Move validation logic to reactive statements
4. Ensure proper event handling with `on:blur`, etc.
5. Update button heights to `h-10`

## Best Practices

1. **Use semantic input types** (`email`, `password`, `tel`, etc.)
2. **Provide helpful descriptions** for complex fields
3. **Use real-time validation** for better UX
4. **Keep error messages concise** and actionable
5. **Group related fields** using grid spans
6. **Test on mobile devices** for usability
7. **Use proper autocomplete** attributes for better UX

## Examples

See the working examples in:

- `/frontend/src/lib/components/auth/LoginForm.svelte`
- `/frontend/src/lib/components/auth/RegisterForm.svelte`
- `/frontend/src/lib/components/FormDemo.svelte`
- Demo page at `/demo`
