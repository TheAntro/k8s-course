export const dynamic = "force-dynamic";

import ImageClient from "@/components/ImageClient";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";

export default function Home() {
  return (
    <main>
      <h1>The project App</h1>

      <ImageClient />
      <TodoForm />
      <TodoList />

      <p>DevOps with Kubernetes 2025/2026</p>
    </main>
  );
}
