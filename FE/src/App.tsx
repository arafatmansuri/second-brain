import PlusIcon from "./components/icons/PlusIcon";
import ShareIcon from "./components/icons/ShareIcon";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";

function App() {
  return (
    <div className="flex gap-4 h-screen">
      <div className="bg-gray-100 w-[75%] p-4">
        <div className="flex justify-between items-center w-full mb-8">
          <h1 className="font-bold text-xl">All Notes</h1>
          <div className="flex gap-2">
            <Button
              size="md"
              text="Share Brain"
              startIcon={<ShareIcon />}
              varient="secondary"
            />
            <Button
              size="md"
              text="Add Content"
              varient="primary"
              startIcon={<PlusIcon size={"md"} />}
            />
          </div>
        </div>
        <section className="flex gap-5">
          <Card
            title="Project Idea"
            link="https://www.youtube.com/watch?v=0KlnSdvsojc"
            type="youtube"
          />
          <Card
            title="VS tweet"
            link="https://x.com/e_opore/status/1930378577431933064"
            type="tweet"
          />
        </section>
      </div>
    </div>
  );
}

export default App;
