module.exports.answers = function answers({ port = 8080 } = {}) {
  return [
    null,
    {
      app: {
        name: 'Chisel Test WP',
        author: 'Xfive Tester',
        projectType: 'wp-with-fe',
        browsers: ['modern'],
      },
    },
    {
      wp: {
        title: 'Chisel Test',
        url: `http://localhost:${port}/`,
        adminUser: 'admin',
        adminPassword: 'a',
        adminEmail: 'jakub.bogucki+chisel-test@xfive.co',
      },
    },
    { wpPlugins: { plugins: [] } },
    {
      databaseHost: '127.0.0.1',
      databasePort: '3306',
      databaseName: `chisel-test-wp-dbrand${Date.now()}`,
      databaseUser: 'root',
      databasePassword: '',
    },
  ];
};
