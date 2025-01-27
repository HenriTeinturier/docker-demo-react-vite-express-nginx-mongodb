import { useEffect, useState } from "react";

interface User {
  name: string;
  email: string;
}

const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch("/api/users");
    const data = await response.json();
    return data as User[];
  } catch (error) {
    console.error("Erreur lors du fetch des users:", error);
    return [];
  }
};

const createUser = async (userData: User): Promise<User | null> => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un user:", error);
    return null;
  }
};

function App() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
    };

    getUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const userData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    };

    const newUser = await createUser(userData);
    if (newUser) {
      setUsers([...users, newUser]);
      form.reset();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Liste des utilisateurs</h1>

      <form onSubmit={handleSubmit} className="my-4 p-4">
        <div className="mb-2  flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Nom"
            className="border p-2"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Ajouter un utilisateur
          </button>
        </div>
      </form>

      <ul>
        {users.map((user) => (
          <li key={user.email}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
