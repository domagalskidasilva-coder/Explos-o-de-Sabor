import { redirect } from "next/navigation";
import AdminLoginForm from "@/src/components/AdminLoginForm";
import BrandLockup from "@/src/components/BrandLockup";
import { isAdminAuthenticated } from "@/src/lib/admin-auth";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 lg:px-6 lg:py-14">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <article className="admin-banner px-6 py-8 sm:px-8 sm:py-10">
          <div className="relative z-10 max-w-2xl space-y-6">
            <BrandLockup />
            <div>
              <p className="section-kicker text-cocoa/76">Área restrita</p>
              <h1 className="mt-3 text-5xl leading-tight text-espresso">
                Painel da operação com leitura mais clara e fluxo mais maduro.
              </h1>
              <p className="mt-4 text-base leading-8 text-espresso/76">
                Acesse para ajustar catálogo, cupons, horários e disponibilidade
                da loja com o mesmo padrão visual do site público.
              </p>
            </div>
          </div>
        </article>

        <section className="panel p-6 sm:p-8">
          <p className="section-kicker text-cocoa/78">Entrar</p>
          <h2 className="mt-3 text-4xl text-espresso">Login do painel</h2>
          <p className="mt-3 text-sm leading-7 text-espresso/74">
            Use usuário e senha para acessar a gestão da loja.
          </p>
          <AdminLoginForm />
        </section>
      </section>
    </main>
  );
}
