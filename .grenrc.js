module.exports = {
  "override": true,
  "username": "xfiveco",
  "ignoreIssuesWith": [
    "wontfix",
    "can't replicate",
    "chisel ignore",
    "invalid",
    "duplicate",
    "question"
  ],
  "template": {
    "issue": "- [{{text}}]({{url}}) {{name}}"
  },
  "groupBy": {
    "Enhancements:": ["enhancement"],
    "Fixes:": ["bug"],
    "Documentation:": ["documentation"]
  }
};
