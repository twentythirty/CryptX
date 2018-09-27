export class Conversion {
  id: number;
  recipe_run_id: number;
  investment_currency: string;
  investment_amount: number | string;
  target_currency: string;
  converted_amount: number | string;
  status: string;
}
