import type { Product, ProductCategory } from "@/src/types/product";

const IMAGENS = {
  guaranaGelado: "/images/produtos/guarana-gelado.png",
  rosquinhaCafe: "/images/produtos/rosquinha-cafe.png",
  iogurteMorango: "/images/produtos/iogurte-morango.png",
  refrigeranteVermelho: "/images/produtos/refrigerante-vermelho.png",
  sucoTropical: "/images/produtos/suco-tropical.png",
  bebidaCremosaVermelha: "/images/produtos/bebida-cremosa-vermelha.png",
  sucoLaranja: "/images/produtos/suco-laranja.png",
  bebidaPremiumGelada: "/images/produtos/bebida-premium-gelada.png",
  salgadoEspecialCaixa: "/images/produtos/salgado-especial-caixa.png",
  boloChocolate: "/images/produtos/bolo-chocolate.png",
} as const;

export const PRODUTOS: Product[] = [
  {
    id: "beb-001",
    nome: "Guaraná gelado",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Bebida em garrafa para acompanhar lanches, kits e combos.",
    preco: 0,
    imagem: IMAGENS.guaranaGelado,
    disponivel: true,
    destaque: true,
  },
  {
    id: "doc-001",
    nome: "Rosquinha com café",
    categoria: "doce",
    subcategoria: "Doces",
    descricaoCurta: "Rosquinha servida com café em uma combinação individual.",
    preco: 0,
    imagem: IMAGENS.rosquinhaCafe,
    disponivel: true,
    destaque: true,
  },
  {
    id: "beb-002",
    nome: "Iogurte de morango",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Bebida cremosa gelada com perfil adocicado e refrescante.",
    preco: 0,
    imagem: IMAGENS.iogurteMorango,
    disponivel: true,
    destaque: false,
  },
  {
    id: "beb-003",
    nome: "Refrigerante vermelho",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Garrafa individual para servir bem gelada.",
    preco: 0,
    imagem: IMAGENS.refrigeranteVermelho,
    disponivel: true,
    destaque: false,
  },
  {
    id: "beb-004",
    nome: "Suco tropical",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta:
      "Bebida cítrica de perfil tropical para acompanhar o pedido.",
    preco: 0,
    imagem: IMAGENS.sucoTropical,
    disponivel: true,
    destaque: false,
  },
  {
    id: "beb-005",
    nome: "Bebida cremosa vermelha",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Opção cremosa para servir gelada em pedidos individuais.",
    preco: 0,
    imagem: IMAGENS.bebidaCremosaVermelha,
    disponivel: true,
    destaque: false,
  },
  {
    id: "beb-006",
    nome: "Suco de laranja",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Bebida cítrica para servir gelada e refrescante.",
    preco: 0,
    imagem: IMAGENS.sucoLaranja,
    disponivel: true,
    destaque: true,
  },
  {
    id: "beb-007",
    nome: "Bebida premium gelada",
    categoria: "bebida",
    subcategoria: "Bebidas",
    descricaoCurta: "Garrafa especial para compor pedidos e kits da loja.",
    preco: 0,
    imagem: IMAGENS.bebidaPremiumGelada,
    disponivel: true,
    destaque: false,
  },
  {
    id: "sal-001",
    nome: "Salgado especial na caixa",
    categoria: "salgado",
    subcategoria: "Salgados",
    descricaoCurta:
      "Salgado individual servido em embalagem pronta para entrega.",
    preco: 0,
    imagem: IMAGENS.salgadoEspecialCaixa,
    disponivel: true,
    destaque: true,
  },
  {
    id: "doc-002",
    nome: "Bolo de chocolate",
    categoria: "doce",
    subcategoria: "Doces",
    descricaoCurta: "Bolo com cobertura intensa para vitrine e encomenda.",
    preco: 0,
    imagem: IMAGENS.boloChocolate,
    disponivel: true,
    destaque: true,
  },
];

export const PRODUTOS_EM_DESTAQUE = PRODUTOS.filter(
  (product) => product.destaque,
);

export const PRODUTOS_POR_ID = new Map(
  PRODUTOS.map((product) => [product.id, product]),
);

export const CATEGORIAS: Array<{ id: ProductCategory; label: string }> = [
  { id: "doce", label: "Doces" },
  { id: "salgado", label: "Salgados" },
  { id: "bebida", label: "Bebidas" },
];
