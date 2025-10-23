
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./footer";


export default function NavbarLayout() {
  return (
    <>
     
      <Navbar /> 
      <main > 
        <Outlet />  
      </main>
      <Footer/>
    </>
  );
}
