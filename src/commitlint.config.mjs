// Format: <tipe>(<scope>): <deskripsi>  (rancangan §18)
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: { "scope-empty": [2, "never"] },
};
export default config;
