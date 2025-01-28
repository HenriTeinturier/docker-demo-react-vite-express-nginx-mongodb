import { useEffect, useState } from "react";

interface Game {
  name: string;
  platform: string;
  rating: string;
}

const fetchGames = async (): Promise<Game[]> => {
  try {
    const response = await fetch("/api/games");
    const data = await response.json();
    return data as Game[];
  } catch (error) {
    console.error("Erreur lors du fetch des jeux:", error);
    return [];
  }
};

const createGame = async (gameData: Game): Promise<Game | null> => {
  try {
    const response = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameData),
    });

    if (response.ok) {
      return response.json();
    }
    return null;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un jeu:", error);
    return null;
  }
};

function App() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const getGames = async () => {
      const data = await fetchGames();
      setGames(data);
    };

    getGames();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const gameData = {
      name: formData.get("name") as string,
      platform: formData.get("platform") as string,
      rating: formData.get("rating") as string,
    };

    const newGame = await createGame(gameData);
    if (newGame) {
      setGames([...games, newGame]);
      form.reset();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold underline">Liste des jeux vidéo</h1>

      <form onSubmit={handleSubmit} className="my-4 p-4">
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            name="name"
            placeholder="Nom du jeu"
            className="border p-2"
            required
          />
          <input
            type="text"
            name="platform"
            placeholder="Plateforme"
            className="border p-2"
            required
          />
          <input
            type="text"
            name="rating"
            placeholder="Note"
            className="border p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
          >
            Ajouter un jeu
          </button>
        </div>
      </form>

      <ul>
        {games.map((game) => (
          <li key={game.name}>
            {game.name} - {game.platform} - Note: {game.rating}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
