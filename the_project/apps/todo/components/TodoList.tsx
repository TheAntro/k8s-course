async function getTodos(): Promise<{ data: { todos: { content: string }[] } }> {
  const res = await fetch(`${process.env.TODO_BACKEND_URL}/todos`);
  return res.json();
}

export default async function TodoList() {
  const {
    data: { todos },
  } = await getTodos();

  return (
    <ul>
      {todos?.map(({ content }) => (
        <li key={content}>{content}</li>
      ))}
    </ul>
  );
}
