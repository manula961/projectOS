"use client";
import { createClient } from "@/lib/supabase/client";
export default function DeleteProjectButton({id}:{id:string}){
  async function remove(){if(!confirm("Delete this project? This cannot be undone.")) return; const supabase=createClient(); const {error}=await supabase.from("projects").delete().eq("id",id); if(error){alert(error.message);return;} window.location.href="/dashboard";}
  return <button className="button danger" onClick={remove}>Delete</button>;
}
