import Link from "next/link";
import { notFound } from "next/navigation";
import {
  applyPublicOrderAction,
  type OrderStatus,
} from "@/src/lib/repositories";

const allowedDecisions = new Set(["aceitar", "recusar"]);

function getDecisionConfig(decision: string) {
  if (decision === "aceitar") {
    return {
      nextStatus: "accepted" as Extract<OrderStatus, "accepted" | "rejected">,
      title: "Pedido aceito",
      description: "O pedido foi marcado como aceito no sistema.",
    };
  }

  return {
    nextStatus: "rejected" as Extract<OrderStatus, "accepted" | "rejected">,
    title: "Pedido recusado",
    description: "O pedido foi marcado como recusado no sistema.",
  };
}

export default async function PublicOrderDecisionPage({
  params,
}: {
  params: Promise<{ token: string; decision: string }>;
}) {
  const { token, decision } = await params;

  if (!allowedDecisions.has(decision)) {
    notFound();
  }

  const config = getDecisionConfig(decision);

  let outcome:
    | {
        orderId: number;
        customerName: string;
        status: OrderStatus;
        alreadyFinalized: boolean;
      }
    | null = null;
  let errorMessage: string | null = null;

  try {
    outcome = await applyPublicOrderAction(token, config.nextStatus);
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Não foi possível atualizar o pedido.";
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <section className="panel space-y-5 p-6 sm:p-8">
        <p className="badge-flour">Atualização do pedido</p>
        <h1 className="text-4xl text-espresso sm:text-5xl">
          {errorMessage
            ? "Link não disponível"
            : outcome?.alreadyFinalized
              ? "Pedido já atualizado"
              : config.title}
        </h1>
        <p className="text-sm leading-8 text-espresso/76">
          {errorMessage
            ? errorMessage
            : outcome?.alreadyFinalized
              ? `O pedido #${outcome.orderId} de ${outcome.customerName} já estava com status ${outcome.status}.`
              : `${config.description} Pedido #${outcome?.orderId} de ${outcome?.customerName}.`}
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/" className="button-primary px-6">
            Voltar ao site
          </Link>
          <Link href="/admin" className="button-secondary px-6">
            Abrir painel
          </Link>
        </div>
      </section>
    </main>
  );
}
