import "./App.css";
import PlusIcon from "./components/icons/PlusIcon";
import ShareIcon from "./components/icons/ShareIcon";
import Button from "./components/ui/Button";

function App() {
  return (
    <>
      <Button
        size="md"
        text="Share Brain"
        startIcon={<ShareIcon size={"lg"} />}
        varient="secondary"
      />
      <Button
        size="lg"
        text="Add Content"
        varient="primary"
        startIcon={<PlusIcon size={"lg"} />}
      />
    </>
  );
}

export default App;
