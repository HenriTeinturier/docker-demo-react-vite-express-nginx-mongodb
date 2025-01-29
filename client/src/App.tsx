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

const deleteGame = async (gameName: string): Promise<boolean> => {
  try {
    const response = await fetch("/api/games", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: gameName }),
    });
    return response.ok;
  } catch (error) {
    console.error("Erreur lors de la suppression du jeu:", error);
    return false;
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

  const handleDelete = async (gameName: string) => {
    const success = await deleteGame(gameName);
    if (success) {
      setGames(games.filter((game) => game.name !== gameName));
    }
  };

  return (
    <div className="container mx-auto max-w-screen-xl">
      <h1 className="text-3xl font-bold underline">Liste des jeux vidéo</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col md:flex-row gap-4 p-4 flex-wrap w-full"
      >
        <input
          type="text"
          name="name"
          placeholder="Nom du jeu"
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="text"
          name="platform"
          placeholder="Plateforme"
          className="px-4 py-2 border rounded-lg"
          required
        />
        <input
          type="number"
          name="rating"
          placeholder="Note"
          className="px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Ajouter
        </button>
      </form>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {games.map((game) => (
          <article
            key={game.name}
            className="bg-white rounded-lg shadow-md p-4 "
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {game.name}
            </h2>
            <p className="text-gray-600 mb-2">Plateforme: {game.platform}</p>
            <div className="card-footer flex justify-between items-center">
              <span className="badge bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                Note: {game.rating}
              </span>
              <button
                onClick={() => handleDelete(game.name)}
                className="delete-btn bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default App;
