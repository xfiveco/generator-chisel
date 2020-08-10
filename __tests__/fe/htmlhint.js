const fs = require('fs-extra');
const { defaultAnswers } = require('./helpers');

describe('FE HTMLHint', () => {
  test('HTMLHint errors are logged and fail build ', async () => {
    await global.chiselTestHelpers.generateProjectWithAnswers(
      ['create'],
      defaultAnswers,
    );

    fs.outputFileSync(
      './src/templates/page-1.twig',
      /* HTML */ `
        <!DOCTYPE html>
        <div notOkAttribute>Hello</div>
      `,
    );
    fs.outputFileSync(
      './src/templates/page-2.twig',
      /* HTML */ `
        <!DOCTYPE html>
        <div>OK!</div>
      `,
    );

    fs.outputFileSync(
      './src/templates/page-3.twig',
      /* HTML */ `
        <div>
          <ul>
            <li id="li1">Line item 1</li>
            <li id="li1">Line item 2</li>
          </ul>
        </div>
      `,
    );

    const consoleMock = jest.spyOn(console, 'log');

    const build = global.chiselTestHelpers.runChiselScript(['build']);

    await expect(build).rejects.toThrowErrorMatchingSnapshot();

    global.chiselTestHelpers.normalizeConsoleMockCalls(consoleMock);
    expect(consoleMock.mock.calls).toMatchSnapshot();
  });
});
