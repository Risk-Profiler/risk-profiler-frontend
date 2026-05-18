import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col gap-6 justify-center items-center">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-bold">Risk Profiler</h1>
        <p className="text-xl text-muted-foreground">AI-powered credit scoring risk calculator for UMKM</p>
      </div>
      
      <Link 
        href="/data_input"
        className="bg-green-accent text-white px-6 py-4 rounded-full hover:bg-green-accent/90 transition cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}
