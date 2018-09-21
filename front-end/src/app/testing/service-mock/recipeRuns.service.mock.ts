import { RecipeAllResponse } from '../../services/recipe-runs/recipe-runs.service';
import { Recipe } from '../../shared/models/recipe';

export const getAllRecipeRunsData: RecipeAllResponse = {
    success: true,
    recipe_runs: [
      new Recipe ({
        approval_comment: 'Good recipe.',
        approval_status: 'recipes.status.42',
        approval_timestamp: 1537278661290,
        approval_user: 'Tautvydas Petkunas',
        approval_user_id: 3,
        created_timestamp: 1537278593777,
        id: 129,
        investment_run_id: 86,
        user_created: 'Tautvydas Petkunas',
        user_created_id: 3
      }),
    ],
    footer: [{
      name: 'id',
      value: '358',
      template: 'recipe_orders.footer.id',
      args: {id: '358'}
    }],
    count: 1
  };
