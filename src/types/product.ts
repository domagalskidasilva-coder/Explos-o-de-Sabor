export type ProductCategory = "doce" | "salgado" | "bebida";

export interface Product {
  id: string;
  nome: string;
  categoria: ProductCategory;
  subcategoria: string;
  descricaoCurta: string;
  preco: number;
  imagem: string;
  disponivel: boolean;
  destaque?: boolean;
}
