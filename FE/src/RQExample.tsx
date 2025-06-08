import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import axios from "axios";

// Create a client
const queryClient = new QueryClient();
type TodoData = {
  createdAt: string;
  status: boolean;
  todo: string;
  updatedAt: string;
  __v: number;
  _id: string;
};

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <Todos />
    </QueryClientProvider>
  );
}

function Todos() {
  // Access the client
  const queryClient = useQueryClient();

  // Queries
  function getTodos() {
    return axios
      .get("http://127.0.0.1:3000/todo/get", { withCredentials: true })
      .then((data) => data.data.Todos);
  }
  async function mn() {
    const todoss = await getTodos();
    console.log(todoss);
  }
  mn();
  const query = useQuery<TodoData[]>({
    queryKey: ["todos"],
    queryFn: async (): Promise<TodoData[]> => {
      const todos = await axios
        .get("http://127.0.0.1:3000/todo/get")
        .then((res) => res.data.Todos);
      return todos;
    },
  });
  console.log(query.data);
  //   Mutations
  const mutation = useMutation({
    mutationFn: async (): Promise<TodoData> => {
      const newTodo: TodoData = await axios.post(
        "http://127.0.0.1:3000/todo/add",
        {
          title: "",
        }
      );
      return newTodo;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
//   if (mutation.error) console.log(mutation.error.response.data.message);
  console.log();
  return (
    <div>
      <ul>
        {query.data?.map((todo: TodoData) => (
          <li>{todo.todo}</li>
        ))}
      </ul>

      <button
        onClick={() => {
          mutation.mutate();
        }}
      >
        Add Todo
      </button>
      <div>{mutation.error && mutation.error.response.data.message}</div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  );
}
export default App;
