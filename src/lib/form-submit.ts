import { startTransition, type FormEvent } from "react";

// React 19 resets every uncontrolled field once a <form action={fn}> finishes,
// and a server action that returns validation errors still counts as finished,
// so the user would lose everything they typed. Submitting from onSubmit inside
// a transition skips that reset while useFormStatus still reports pending.
// Keep action={formAction} on the form too: it is what submits the form if it
// is used before hydration.
export function submitKeepingValues(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };
}
