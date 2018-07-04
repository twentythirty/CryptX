/** Function to delay application initialization using a promises.
 * Whenever resolve() is called is when application will resume bootstrapping,
 * executing routing, drawing components, etc.
 * Services can injected into this function through core app.module file,
 * adding dependencies to deps array.
 * */
export function appInitialization(authService): () => Promise<any> {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {

      authService.checkAuth().subscribe(response => {
        resolve();
      }, error => {
        authService.deauthorize();
        resolve();
      });
    });
  };
}
