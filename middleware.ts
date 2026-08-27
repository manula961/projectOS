import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;
  const supabase = createServerClient(url,key,{cookies:{getAll(){return request.cookies.getAll()},setAll(items){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options))}}});
  const {data:{user}}=await supabase.auth.getUser();
  const protectedPath = ['/dashboard','/projects','/tasks','/timeline','/technologies','/analytics','/files','/settings'].some(p=>request.nextUrl.pathname.startsWith(p));
  if(protectedPath && !user){ const u=request.nextUrl.clone(); u.pathname='/login'; return NextResponse.redirect(u); }
  if(request.nextUrl.pathname==='/login' && user){ const u=request.nextUrl.clone(); u.pathname='/dashboard'; return NextResponse.redirect(u); }
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
