<script lang="ts">
  export let label: string;
  export let name: string;
  export let type = "text";
  export let value: string;
  export let description = "";
  export let error = "";
  export let placeholder = "";
  export let disabled = false;
  export let autocomplete: string | null | undefined = undefined;
  export let min: number | undefined = undefined;
  export let max: number | undefined = undefined;
  export let required = false;
  export let rows: number | undefined = undefined;

  // Support for class prop to add additional styling
  let className = "";
  export { className as class };
</script>

<div class="form-control w-full {className}">
  <label class="label" for={name}>
    <span class="label-text">
      {label}
      {#if required}
        <span class="text-error">*</span>
      {/if}
    </span>
  </label>
  {#if rows}
    <textarea
      bind:value
      name={name}
      id={name}
      class="textarea textarea-bordered w-full {error ? 'textarea-error' : ''}"
      class:textarea-error={error}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={description || error ? `${name}-desc` : undefined}
      {placeholder}
      {disabled}
      {rows}
      {required}
      on:blur
      on:input
      on:focus
      on:change
    ></textarea>
  {:else}
    <input
      bind:value
      type={type}
      name={name}
      id={name}
      class="input input-bordered w-full h-10 {error ? 'input-error' : ''}"
      class:input-error={error}
      aria-invalid={error ? "true" : "false"}
      aria-describedby={description || error ? `${name}-desc` : undefined}
      {placeholder}
      {disabled}
      autocomplete={autocomplete as any}
      {min}
      {max}
      {required}
      on:blur
      on:input
      on:focus
      on:change
    />
  {/if}
  <div class="label">
    {#if description}
      <span class="label-text-alt text-base-content/60" id={`${name}-desc`}>{description}</span>
    {/if}
    {#if error}
      <span class="label-text-alt text-error" id={`${name}-error`}>{error}</span>
    {/if}
  </div>
</div>
