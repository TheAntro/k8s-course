"use client";

import { useActionState } from "react";

import { addTodo } from "@/actions/addTodo";

function SubmitButton() {
  return <button type="submit">{"Add Todo"}</button>;
}

export default function TodoForm() {
  // state: return value from action; formAction: goes into the form 'action' prop
  const [_state, formAction] = useActionState(addTodo, { message: "" });

  return (
    <form action={formAction}>
      <input type="text" name="todo" required />
      <SubmitButton />
    </form>
  );
}
