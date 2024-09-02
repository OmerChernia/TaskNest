import TodoList from '../components/ui/TodoList';
import '../app/globals.css'


export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Todo App</h1>
      <TodoList />
    </main>
  );
}