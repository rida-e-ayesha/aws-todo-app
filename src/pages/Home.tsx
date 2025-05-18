import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Trash2, LogOut, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  userId: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [userName, setUserName] = useState<string | null>(null);
  const { user, logout, getUserName } = useAuth();
  const [isAdding, setisAdding] = useState(false);
  const [fetchingTodos, setFetchingTodos] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    const name = await getUserName();
    setUserName(name);
  };

  const fetchTodos = async () => {
    if (!user) return;
    const querySnapshot = await getDocs(collection(db, 'todos'));
    const todosData = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as Todo))
      .filter(todo => todo.userId === user.uid);
    setTodos(todosData);
    setFetchingTodos(false);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !user) return;
    setisAdding(true);
    try {
      await addDoc(collection(db, 'todos'), {
        title: newTodo,
        completed: false,
        userId: user.uid
      });
      setNewTodo('');
      fetchTodos();
      toast.success('Todo added successfully!');
    } catch (error) {
      toast.error('Failed to add todo');
    } finally {
      setisAdding(false);
    }
  };

  const toggleTodo = async (todo: Todo) => {
    try {
      await updateDoc(doc(db, 'todos', todo.id), {
        completed: !todo.completed
      });
      fetchTodos();
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'todos', id));
      fetchTodos();
      toast.success('Todo deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-indigo-900">Your Tasks</h1>
            <p className="text-indigo-600 mt-2">Welcome back, {userName || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>

        <form onSubmit={addTodo} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 rounded-lg border-2 border-indigo-100 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-4 py-3 text-lg"
            />
            <button
              type="submit"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              {isAdding ? "Adding..." : "Add Task"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-4 border-b border-indigo-50 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center flex-1">
                <button
                  onClick={() => toggleTodo(todo)}
                  className={`flex items-center justify-center h-6 w-6 rounded-full border-2 ${todo.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 hover:border-indigo-500'
                    }`}
                >
                  {todo.completed && <CheckCircle2 className="h-4 w-4" />}
                </button>
                <span
                  className={`ml-3 text-lg ${todo.completed
                    ? 'line-through text-gray-400'
                    : 'text-gray-800'
                    }`}
                >
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
          {todos.length === 0 && !fetchingTodos && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No tasks yet. Add one above!</p>
            </div>
          )}
          {fetchingTodos && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}