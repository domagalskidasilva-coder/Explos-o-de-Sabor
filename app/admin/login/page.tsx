import { redirect } from "next/navigation";
import AdminLoginForm from "@/src/components/AdminLoginForm";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 lg:px-6">
      <section className="panel p-6 sm:p-8">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-cocoa/82">
          Área restrita
        </p>
        <h1 className="mt-2 text-4xl text-espresso">Login do painel</h1>
        <p className="mt-3 text-sm leading-7 text-espresso/76">
          Use usuário e senha para acessar a gestão da loja.
        </p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
