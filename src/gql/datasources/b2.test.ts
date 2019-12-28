import B2Api from "./b2";

// TODO: was using this to test directly against server; could mock server
// responses if desired/needed

xit("authorizes if needed", async () => {
  const b2 = new B2Api();
  b2.initialize({} as any);

  const res = await b2.getUploadUrl();

  expect(res).not.toBeUndefined();
});
