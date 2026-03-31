import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 h-16 bg-black text-white">
      
      <div className="text-xl font-bold">
        Zer0wave
      </div>

      <div>
        <Link href="/login">
          <button className="bg-white text-black px-4 py-2 rounded-md">
            Login
          </button>
        </Link>
      </div>


<div>
   
  <Link href="/logout">
  <button className="bg-white text-black px-4 py-2 rounded-md">
    Logout
  </button>
</Link> 
</div>
    </nav>


  );
}

<nav>


</nav>