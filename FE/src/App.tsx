import "./App.css";
import PlusIcon from "./components/icons/PlusIcon";
import ShareIcon from "./components/icons/ShareIcon";
import Button from "./components/ui/Button";

function App() {
  return (
    <>
      <Button
        size="sm"
        text="Share Brain"
        startIcon={<ShareIcon />}
        varient="secondary"
      />
      <Button
        size="lg"
        text="Add Content"
        varient="primary"
        startIcon={<PlusIcon size={"lg"} />}
      />
      <Button
        size="md"
        text="Add Content"
        varient="primary"
        startIcon={<PlusIcon size={"md"} />}
      />
    </>
  );
}

export default App;
