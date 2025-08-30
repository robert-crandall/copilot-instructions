<script lang="ts">
  import FormField from './FormField.svelte';

  let email = "";
  let password = "";
  let name = "";
  let confirmPassword = "";
  let message = "";
  let acceptTerms = false;
  let errors = { 
    email: "", 
    password: "", 
    name: "", 
    confirmPassword: "",
    message: "",
    terms: ""
  };

  function validateEmail(value: string): string {
    if (!value) return "Email is required";
    if (!value.includes("@")) return "Invalid email address";
    return "";
  }

  function validatePassword(value: string): string {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    return "";
  }

  function validateName(value: string): string {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    return "";
  }

  function validateConfirmPassword(value: string): string {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return "";
  }

  function validateMessage(value: string): string {
    if (!value) return "Message is required";
    if (value.length < 10) return "Message must be at least 10 characters";
    if (value.length > 500) return "Message cannot exceed 500 characters";
    return "";
  }

  function handleSubmit() {
    // Validate all fields
    errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      name: validateName(name),
      confirmPassword: validateConfirmPassword(confirmPassword),
      message: validateMessage(message),
      terms: acceptTerms ? "" : "You must accept the terms and conditions"
    };

    // Check if form is valid
    const hasErrors = Object.values(errors).some(error => error !== "");
    
    if (!hasErrors) {
      alert("Form submitted successfully! Check console for values.");
      console.log({ email, password, name, message, acceptTerms });
    }
  }

  // Real-time validation
  $: errors.email = email ? validateEmail(email) : "";
  $: errors.password = password ? validatePassword(password) : "";
  $: errors.name = name ? validateName(name) : "";
  $: errors.confirmPassword = confirmPassword ? validateConfirmPassword(confirmPassword) : "";
  $: errors.message = message ? validateMessage(message) : "";
</script>

<div class="max-w-4xl mx-auto p-6">
  <div class="mb-8">
    <h1 class="text-3xl font-bold mb-2">Form Component Demo</h1>
    <p class="text-base-content/70">
      Showcasing the standardized FormField component with DaisyUI 5 styling, grid layout, 
      and mobile-responsive design.
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Form Section -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Registration Form</h2>
        
        <form on:submit|preventDefault={handleSubmit} class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            name="name"
            bind:value={name}
            description="Enter your first and last name"
            error={errors.name}
            placeholder="John Doe"
            autocomplete="name"
            required
            class="md:col-span-2"
          />
          
          <FormField
            label="Email Address"
            name="email"
            type="email"
            bind:value={email}
            description="We'll never share your email with anyone"
            error={errors.email}
            placeholder="you@example.com"
            autocomplete="email"
            required
            class="md:col-span-2"
          />
          
          <FormField
            label="Password"
            name="password"
            type="password"
            bind:value={password}
            description="Must be at least 8 characters long"
            error={errors.password}
            placeholder="••••••••"
            autocomplete="new-password"
            required
            min={8}
          />
          
          <FormField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            bind:value={confirmPassword}
            description="Re-enter your password"
            error={errors.confirmPassword}
            placeholder="••••••••"
            autocomplete="new-password"
            required
          />

          <FormField
            label="Message"
            name="message"
            bind:value={message}
            description="Tell us a bit about yourself (10-500 characters)"
            error={errors.message}
            placeholder="I'm interested in this service because..."
            required
            rows={4}
            min={10}
            max={500}
            class="md:col-span-2"
          />

          <!-- Terms and Conditions -->
          <div class="form-control md:col-span-2">
            <label class="label cursor-pointer justify-start gap-3">
              <input 
                type="checkbox" 
                bind:checked={acceptTerms} 
                class="checkbox checkbox-primary" 
                id="terms"
              />
              <span class="label-text">
                I agree to the 
                <a href="/terms" class="link link-primary">Terms and Conditions</a>
                and 
                <a href="/privacy" class="link link-primary">Privacy Policy</a>
              </span>
            </label>
            {#if errors.terms}
              <div class="label">
                <span class="label-text-alt text-error">{errors.terms}</span>
              </div>
            {/if}
          </div>

          <!-- Submit Button -->
          <div class="md:col-span-2 mt-4">
            <button type="submit" class="btn btn-primary w-full h-10">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Documentation Section -->
    <div class="space-y-6">
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">Features Demonstrated</h3>
          <ul class="list-disc list-inside space-y-2 text-sm">
            <li>DaisyUI form-control structure</li>
            <li>Responsive grid layout (1 col → 2 cols)</li>
            <li>Real-time validation feedback</li>
            <li>Textarea support (4-line message field)</li>
            <li>Accessible ARIA attributes</li>
            <li>Consistent 44px+ touch targets</li>
            <li>Mobile-first responsive design</li>
            <li>Error and help text positioning</li>
            <li>Proper autocomplete attributes</li>
          </ul>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">Form Values</h3>
          <div class="space-y-2 text-sm font-mono">
            <div>Name: <span class="text-accent">{name || "empty"}</span></div>
            <div>Email: <span class="text-accent">{email || "empty"}</span></div>
            <div>Password: <span class="text-accent">{password ? "•".repeat(password.length) : "empty"}</span></div>
            <div>Message: <span class="text-accent">{message ? `${message.length} chars` : "empty"}</span></div>
            <div>Terms: <span class="text-accent">{acceptTerms ? "accepted" : "not accepted"}</span></div>
          </div>
        </div>
      </div>

      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-lg">Usage</h3>
          <div class="text-sm">
            <pre class="bg-base-300 p-3 rounded text-xs overflow-x-auto"><code>&lt;FormField
  label="Email"
  name="email"
  type="email"
  bind:value={email}
  error={errors.email}
  description="Help text here"
  class="md:col-span-2"
/&gt;

&lt;!-- Textarea example --&gt;
&lt;FormField
  label="Message"
  name="message"
  bind:value={message}
  rows={4}
  class="md:col-span-2"
/&gt;</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
