import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EntitiesFilter } from '../../shared/models/api/entitiesFilter';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../shared/models/recipe';

export class RecipeAllResponse {
    success: boolean;
    recipe_runs: Array<Recipe>;
    footer: Array<any>;
    count: number;
  }

@Injectable()

export class RecipeRunsService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getAllRecipeRuns(requestData?: EntitiesFilter): Observable<RecipeAllResponse> {
      return this.http.post<RecipeAllResponse>(this.baseUrl + `recipes/all`, requestData);
  }

  getHeaderLOV(column_name: string): Observable<any> {
    return this.http.get<any>(this.baseUrl + `recipes/header_lov/${column_name}`).pipe(
      map(
        res => {
          if (res && Array.isArray(res.lov)) {
            return res.lov.map(lov => {
              if (lov !== null) {
                return { value: lov.toString() };
              } else {
                return {value: '-'};
              }
            });
          } else { return null; }
        }
      )
    );
  }

}
