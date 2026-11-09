export const brl = value => new Intl.NumberFormat("pt-BR", {
  style: "currency", currency: "BRL"
}).format(Number(value) || 0);
export const dateBR = value => {
  const date = value?.toDate?.() || (value instanceof Date ? value : null);
  return date ? date.toLocaleDateString("pt-BR") : "Data indisponível";
};
export const todayISO = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
