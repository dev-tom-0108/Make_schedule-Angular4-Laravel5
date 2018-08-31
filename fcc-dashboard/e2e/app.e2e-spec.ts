import { FccAdminPage } from './app.po';

describe('fcc-admin App', function() {
  let page: FccAdminPage;

  beforeEach(() => {
    page = new FccAdminPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
