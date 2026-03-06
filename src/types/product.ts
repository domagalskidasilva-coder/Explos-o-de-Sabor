export type ProductCategory = "doce" | "salgado";

export interface Product {
  id: string;
  nome: string;
  categoria: ProductCategory;
  subcategoria: string;
  descricaoCurta: string;
  precoCents: number;
  imagem: string;
  disponivel: boolean;
  destaque?: boolean;
}
