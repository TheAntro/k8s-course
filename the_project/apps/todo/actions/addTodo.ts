"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(prevState: any, formData: FormData) {
  const todo = formData.get("todo");
  await fetch(`${process.env.TODO_BACKEND_URL}/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: todo }),
  });

  revalidatePath("/");

  return { message: "Success!" };
}
